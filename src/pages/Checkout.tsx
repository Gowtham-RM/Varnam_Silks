import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Lock, Smartphone, QrCode as QrCodeIcon, BadgeCheck, ShieldCheck, Zap } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import api from '@/lib/api';
import paymentService from '@/services/paymentService';

const addressSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
});

const Checkout: React.FC = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi'>('razorpay');
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [upiQrCode, setUpiQrCode] = useState<string>('');
  const [paymentGatewayError, setPaymentGatewayError] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getCartTotal();
  const shipping = subtotal > 2999 ? 0 : 199;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const createOrderInBackend = async (paymentData: any) => {
    const orderData = {
      user: user?.id,
      items: items.map(item => ({
        product: item.productId || item.product?.id || (item.product as any)?._id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color
      })),
      totalAmount: total,
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: 'India'
      },
      paymentMethod: paymentMethod === 'razorpay' ? 'Razorpay' : 'UPI',
      paymentStatus: 'paid',
      paymentDetails: paymentData
    };

    const { data: order } = await api.post('/orders', orderData);
    return order;
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentGatewayError('');

      // Create Razorpay order
      const { order, key } = await paymentService.createOrder(
        total,
        `order_${Date.now()}`,
        { items: items.length }
      );

      // Open Razorpay modal
      await paymentService.openRazorpayModal(
        order.id,
        total,
        key,
        {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        async (response) => {
          // Payment successful
          try {
            // Verify payment
            await paymentService.verifyPayment(response);

            // Create order in backend
            const order = await createOrderInBackend({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            clearCart();
            toast.success('Payment successful!');
            navigate('/payment-success', { 
              state: { 
                orderId: order._id || order.id, 
                total,
                paymentId: response.razorpay_payment_id
              } 
            });
          } catch (error: any) {
            console.error('Order creation error:', error);
            toast.error('Payment successful but order creation failed. Please contact support.');
          }
        },
        (error) => {
          // Payment failed
          console.error('Payment error:', error);
          toast.error(error.description || 'Payment failed. Please try again.');
          setIsProcessing(false);
        }
      );
    } catch (error: any) {
      console.error('Razorpay error:', error);
      const backendMessage = error.response?.data?.message;
      const backendError = error.response?.data?.error;
      const isGatewayNotConfigured =
        error.response?.status === 503 ||
        /not configured|add razorpay keys/i.test(backendMessage || '');

      if (isGatewayNotConfigured) {
        const fallbackMessage = 'Online payment is unavailable. Switched to UPI QR payment.';
        setPaymentMethod('upi');
        setPaymentGatewayError(backendMessage || fallbackMessage);
        toast.info(fallbackMessage);
        await handleUpiPayment();
        return;
      }

      const friendlyError = backendMessage
        ? `${backendMessage}${backendError ? ` (${backendError})` : ''}`
        : 'Failed to initiate payment';
      setPaymentGatewayError(friendlyError);
      toast.error(friendlyError);
      setIsProcessing(false);
    }
  };

  const handleUpiPayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentGatewayError('');

      // Generate UPI QR code
      const qrData = await paymentService.generateUpiQr(total);
      setUpiQrCode(qrData.qrCode);
      setShowUpiQr(true);
      setIsProcessing(false);

      toast.info('Scan the QR code with any UPI app to complete payment');
    } catch (error: any) {
      console.error('UPI QR generation error:', error);
      toast.error('Failed to generate UPI QR code');
      setIsProcessing(false);
    }
  };

  const handlePaymentConfirmed = async () => {
    try {
      setIsProcessing(true);
      
      // Create order in backend (manual UPI payment)
      const order = await createOrderInBackend({
        method: 'UPI',
        status: 'pending_verification'
      });

      setShowUpiQr(false);
      clearCart();
      toast.success('Order placed! We will verify your payment shortly.');
      navigate('/payment-success', { 
        state: { 
          orderId: order._id || order.id, 
          total,
          paymentMethod: 'UPI'
        } 
      });
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    // Validate form
    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    // Process payment based on selected method
    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      await handleUpiPayment();
    }
  };

  // Redirect if cart is empty or user is not authenticated
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    } else if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [items.length, isAuthenticated, navigate]);

  // Don't render checkout form if redirecting
  if (items.length === 0 || !isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-5 md:py-8 lg:py-10">
        <h1 className="font-display text-2xl font-semibold md:text-3xl">Checkout</h1>

        <div className="mt-5 grid gap-5 md:mt-6 md:gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          {/* Checkout form */}
          <div className="space-y-5 md:space-y-6">
            {/* Contact */}
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
              <h2 className="font-display text-lg font-semibold">Contact Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
              <h2 className="font-display text-lg font-semibold">Shipping Address</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="mt-1.5"
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-destructive">{errors.street}</p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1.5"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1.5"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-destructive">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="mt-1.5"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-destructive">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">Payment Method</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  100% Secure Checkout
                </span>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">UPI</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Cards</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Net Banking</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Wallets</span>
              </div>

              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'razorpay' | 'upi')}>
                <div className="space-y-3">
                  {/* Razorpay Option */}
                  <div className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-muted/40'
                  }`} onClick={() => setPaymentMethod('razorpay')}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="razorpay" id="razorpay" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="razorpay" className="cursor-pointer text-sm font-semibold md:text-base">
                          <span className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Pay Online (Recommended)
                          </span>
                        </Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Use UPI, Cards, Net Banking and Wallets with instant confirmation.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            <Zap className="h-3 w-3" />
                            Instant
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            <BadgeCheck className="h-3 w-3" />
                            Trusted Gateway
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'razorpay' && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                      <p className="font-medium text-foreground">Next step to complete payment</p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                        <li>Click <span className="font-medium text-foreground">Pay ₹{total.toLocaleString()}</span>.</li>
                        <li>Razorpay popup will open with UPI, Cards, Net Banking, and Wallet options.</li>
                        <li>Complete payment and wait for automatic redirect to success page.</li>
                      </ol>
                    </div>
                  )}

                  {/* UPI QR Code Option */}
                  <div className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-muted/40'
                  }`} onClick={() => setPaymentMethod('upi')}>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="upi" id="upi" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="upi" className="cursor-pointer text-sm font-semibold md:text-base">
                          <span className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-primary" />
                            UPI QR Payment
                          </span>
                        </Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Scan and pay with PhonePe, Google Pay, Paytm, BHIM and other UPI apps.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">No extra charges</span>
                          <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">Fast confirmation</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                      <p className="font-medium text-foreground">Next step to complete payment</p>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                        <li>Click <span className="font-medium text-foreground">Generate QR Code</span>.</li>
                        <li>Scan the QR code using any UPI app and complete payment.</li>
                        <li>Click <span className="font-medium text-foreground">I have completed the payment</span>.</li>
                      </ol>
                    </div>
                  )}
                </div>
              </RadioGroup>

              <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                Tip: For fastest checkout, choose "Pay Online". Your payment is encrypted and securely processed.
              </div>

              {paymentGatewayError && paymentMethod === 'razorpay' && (
                <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  {paymentGatewayError}
                </div>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="sticky top-28 rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Order Summary</h2>

              {/* Items */}
              <div className="mt-4 max-h-64 space-y-4 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-12 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                variant="hero"
                size="lg"
                className="mt-6 h-11 w-full md:h-12"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === 'upi' ? (
                  <>
                    <QrCodeIcon className="mr-2 h-4 w-4" />
                    Generate QR Code
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Pay ₹{total.toLocaleString()}
                  </>
                )}
              </Button>

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                {paymentMethod === 'razorpay' ? 'Secured by Razorpay' : '100% Secure UPI Payment'}
              </p>
            </div>
          </div>
        </div>

        {/* UPI QR Code Dialog */}
        <Dialog open={showUpiQr} onOpenChange={setShowUpiQr}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan QR Code to Pay</DialogTitle>
              <DialogDescription>
                Open any UPI app and scan this QR code to complete your payment of ₹{total.toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-6">
              {upiQrCode && (
                <>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img 
                      src={upiQrCode} 
                      alt="UPI QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    Supported apps: PhonePe, Google Pay, Paytm, BHIM, and more
                  </p>
                  <div className="mt-6 w-full space-y-2">
                    <Button 
                      onClick={handlePaymentConfirmed}
                      variant="hero"
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'I have completed the payment'
                      )}
                    </Button>
                    <Button 
                      onClick={() => setShowUpiQr(false)}
                      variant="outline"
                      className="w-full"
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-center text-muted-foreground">
                    Note: After payment, click "I have completed the payment" above. 
                    We'll verify your payment and confirm your order.
                  </p>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Checkout;
