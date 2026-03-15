# Razorpay Payment Integration - Setup Guide

## Overview
VARNAM SILKS now supports secure online payments through Razorpay with multiple payment options including:
- Credit/Debit Cards (Visa, Mastercard, Amex, etc.)
- UPI (PhonePe, Google Pay, Paytm, BHIM, etc.)
- Net Banking
- Wallets (Paytm, PhonePe, Amazon Pay, etc.)
- UPI QR Code (Free, no payment gateway charges)

## Features Implemented
1. ✅ Razorpay payment gateway integration
2. ✅ UPI QR code generation for direct UPI payments
3. ✅ Payment verification and order creation
4. ✅ Multiple payment method selection
5. ✅ Secure payment processing
6. ✅ Payment logos in footer

## Setup Instructions

### 1. Get Razorpay Credentials (FREE for Testing)

1. Go to https://razorpay.com/
2. Click "Sign Up" and create a free account
3. Once logged in, go to Settings → API Keys
4. You'll see two sets of keys:
   - **Test Keys** (for development) - FREE forever
   - **Live Keys** (for production) - requires business verification

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Razorpay Test Mode (FREE)
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**Default test credentials are already configured for quick testing!**

### 3. Testing Payments (FREE)

#### Razorpay Test Mode
When using test mode, you can use test card details:
- **Card Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Name**: Any name

Test UPI IDs:
- success@razorpay
- failure@razorpay

**Note**: Test mode transactions are FREE and don't process real money.

#### UPI QR Code Payment
The UPI QR code feature generates a standard UPI payment QR that can be scanned with any UPI app:
- PhonePe
- Google Pay
- Paytm
- BHIM
- Any UPI-enabled banking app

**Note**: In test mode, the UPI QR shows a demo QR. In production, it will generate real UPI payment QR codes.

## Payment Flow

### Razorpay Flow:
1. User fills checkout form
2. Selects "Razorpay" payment method
3. Clicks "Pay" button
4. Razorpay modal opens with multiple payment options
5. User completes payment
6. Payment is verified on backend
7. Order is created in database
8. User redirected to success page

### UPI QR Code Flow:
1. User fills checkout form
2. Selects "UPI QR Code" payment method
3. Clicks "Generate QR Code" button
4. QR code is displayed in a modal
5. User scans QR with any UPI app
6. User completes payment in their UPI app
7. User clicks "I have completed the payment"
8. Order is created with pending verification status
9. Admin verifies payment manually

## Production Setup

### Going Live with Razorpay:

1. **Complete KYC**: Submit business documents in Razorpay dashboard
2. **Get Live Keys**: Once approved, activate live mode and get live API keys
3. **Update Environment**: Replace test keys with live keys in `.env`
4. **Webhook Setup** (Optional): Configure webhooks for automatic payment status updates
5. **Update UPI ID**: Change the UPI ID in `server/routes/payment.js` to your business UPI ID

### Razorpay Pricing (Production):
- **2% + ₹0** per transaction for Indian cards
- **Free** for UPI payments (zero MDR)
- **1.99%** for net banking
- No setup fees, no annual fees

## Security Features
- ✅ Payment signature verification
- ✅ HTTPS encryption (Razorpay hosted)
- ✅ PCI DSS compliant
- ✅ 3D Secure authentication
- ✅ Fraud detection by Razorpay

## Files Modified/Created
- `server/routes/payment.js` - Payment API endpoints
- `src/services/paymentService.ts` - Frontend payment service
- `src/pages/Checkout.tsx` - Updated checkout with payment options
- `src/components/layout/Footer.tsx` - Added payment logos
- `.env.example` - Added Razorpay configuration

## API Endpoints
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment signature
- `POST /api/payment/generate-upi-qr` - Generate UPI QR code
- `GET /api/payment/payment/:paymentId` - Get payment details

## Testing Checklist
- [ ] Razorpay payment modal opens
- [ ] Test card payment works
- [ ] Test UPI payment works
- [ ] UPI QR code generates correctly
- [ ] Payment verification works
- [ ] Order is created after successful payment
- [ ] User redirected to success page
- [ ] Payment method is saved in order

## Support
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/
- Test Card Details: https://razorpay.com/docs/payments/payments/test-card-details/

## Notes
- UPI QR code payments are **100% FREE** (no charges from Razorpay)
- Test mode is **FREE** and doesn't expire
- Production mode charges apply only for successful transactions
- No monthly fees or setup costs
