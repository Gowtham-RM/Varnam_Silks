import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const addressSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
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

    setIsProcessing(true);

    // Simulate Razorpay payment
    // In production, this would integrate with actual Razorpay SDK
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful payment
      const orderId = `ORD-${Date.now()}`;
      
      clearCart();
      toast.success('Payment successful!');
      navigate('/payment-success', { state: { orderId, total } });
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="font-display text-3xl font-semibold">Checkout</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Checkout form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <div className="rounded-xl border border-border p-6">
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
            <div className="rounded-xl border border-border p-6">
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
            <div className="rounded-xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold">Payment Method</h2>
              <div className="mt-4">
                <div className="flex items-center gap-4 rounded-lg border-2 border-primary bg-primary/5 p-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Razorpay</p>
                    <p className="text-sm text-muted-foreground">
                      Pay securely with UPI, Cards, or Net Banking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Order Summary</h2>
              
              {/* Items */}
              <div className="mt-4 max-h-64 space-y-4 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
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
                className="mt-6 w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
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
                Secured by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
