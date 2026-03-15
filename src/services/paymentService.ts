import api from '@/lib/api';

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface UpiQrResponse {
  success: boolean;
  qrCode: string;
  upiString: string;
  upiId: string;
  amount: number;
}

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

class PaymentService {
  /**
   * Load Razorpay script dynamically
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Create Razorpay order
   */
  async createOrder(amount: number, receipt?: string, notes?: any): Promise<{ order: RazorpayOrder; key: string }> {
    const response = await api.post('/payment/create-order', {
      amount,
      currency: 'INR',
      receipt: receipt || `order_${Date.now()}`,
      notes
    });
    return response.data;
  }

  /**
   * Verify Razorpay payment
   */
  async verifyPayment(paymentData: RazorpayResponse): Promise<any> {
    const response = await api.post('/payment/verify-payment', paymentData);
    return response.data;
  }

  /**
   * Generate UPI QR Code
   */
  async generateUpiQr(amount: number, name?: string, upiId?: string): Promise<UpiQrResponse> {
    const response = await api.post('/payment/generate-upi-qr', {
      amount,
      name: name || 'VARNAM SILKS',
      upiId: upiId || 'varnamsilks@paytm'
    });
    return response.data;
  }

  /**
   * Open Razorpay payment modal
   */
  async openRazorpayModal(
    orderId: string,
    amount: number,
    key: string,
    userDetails: {
      name: string;
      email: string;
      contact: string;
    },
    onSuccess: (response: RazorpayResponse) => void,
    onFailure: (error: any) => void
  ): Promise<void> {
    // Load Razorpay script
    const scriptLoaded = await this.loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    const options = {
      key: key,
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'VARNAM SILKS',
      description: 'Order Payment',
      image: '/logo.png', // Add your logo
      order_id: orderId,
      prefill: {
        name: userDetails.name,
        email: userDetails.email,
        contact: userDetails.contact
      },
      theme: {
        color: '#E11D48' // Your brand color (rose-600)
      },
      modal: {
        ondismiss: () => {
          onFailure({ message: 'Payment cancelled by user' });
        }
      },
      handler: function (response: RazorpayResponse) {
        onSuccess(response);
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response: any) {
      onFailure(response.error);
    });

    razorpay.open();
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<any> {
    const response = await api.get(`/payment/payment/${paymentId}`);
    return response.data;
  }
}

export default new PaymentService();
