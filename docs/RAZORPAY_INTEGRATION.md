# Razorpay Payment Integration Guide

## Overview
This codebase now includes Razorpay Standard Web Checkout integration for processing payments. The implementation follows security best practices with proper signature verification.

## Files Modified/Created

### Backend
1. **server.ts** - Added Razorpay endpoints
   - POST `/api/create-order` - Creates Razorpay orders
   - POST `/api/verify-payment` - Verifies payment signatures
   - Imports: `razorpay`, `crypto` modules

2. **.env** - Added configuration
   - `RAZORPAY_KEY_ID` - Public key for backend (never expose to frontend)
   - `RAZORPAY_KEY_SECRET` - Secret key for signature verification (backend only)
   - `VITE_RAZORPAY_KEY_ID` - Public key for frontend

### Frontend Components
1. **src/components/RazorpayCheckout.tsx** - Reusable payment component
   - Loads Razorpay script dynamically
   - Handles payment flow and signature verification
   - Shows payment status (loading, success, error)

2. **src/components/PaymentCheckoutPage.tsx** - Example checkout page
   - Displays order summary
   - Shows item list, tax, shipping, total
   - Integrates RazorpayCheckout component

### Dependencies
- `razorpay` - Razorpay Node.js SDK (for backend)
- `crypto` - Node.js built-in (for signature verification)

## Configuration

### Environment Variables (.env)
```
# Backend credentials (server-side only)
RAZORPAY_KEY_ID=rzp_test_T0NTYXYnMDFgQw
RAZORPAY_KEY_SECRET=YRPtDYUbLdcBYH9gQ5cAZEH1

# Frontend public key
VITE_RAZORPAY_KEY_ID=rzp_test_T0NTYXYnMDFgQw
```

**Important**: 
- `.env` file is already in `.gitignore` - it won't be committed
- `RAZORPAY_KEY_SECRET` should NEVER be exposed to frontend
- `RAZORPAY_KEY_ID` can be public (same as frontend key)

## API Endpoints

### 1. POST /api/create-order
Creates a Razorpay order for payment processing.

**Request:**
```json
{
  "amount": 50000,           // Amount in paise (100 paise = ₹1)
  "currency": "INR",         // Optional, defaults to INR
  "receipt": "receipt_123",  // Unique receipt ID for this order
  "description": "Order for products",  // Optional
  "customer_id": "cust_123", // Optional
  "email": "user@example.com" // Optional
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "order_id": "order_1c5831c...",
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt_123"
}
```

**Response (Error - 400/500):**
```json
{
  "error": "Error message here"
}
```

**Validation:**
- Amount must be >= 100 paise (₹1 minimum)
- Receipt ID is required
- Returns 500 if Razorpay API fails

### 2. POST /api/verify-payment
Verifies the payment signature for security.

**Request:**
```json
{
  "razorpay_order_id": "order_1c5831c...",
  "razorpay_payment_id": "pay_1c5831c...",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order_id": "order_1c5831c...",
  "payment_id": "pay_1c5831c..."
}
```

**Response (Failure - 400):**
```json
{
  "success": false,
  "error": "Payment verification failed - signature mismatch"
}
```

**Security:**
- Uses HMAC-SHA256 algorithm
- Formula: `HMAC-SHA256(order_id|payment_id, RAZORPAY_KEY_SECRET)`
- Signature mismatch indicates tampering
- Never marks payment as successful if signatures don't match

## Frontend Usage

### Basic Implementation

```typescript
import RazorpayCheckout from './components/RazorpayCheckout';

export default function CheckoutPage() {
  return (
    <RazorpayCheckout
      amount={50000}              // ₹500 in paise
      currency="INR"              // Optional
      receipt="order_12345"       // Unique receipt ID
      description="Order for 2 items"
      email="customer@email.com"
      customerId="cust_123"
      onSuccess={(data) => {
        console.log('Payment successful:', data);
        // Update database, redirect to success page, etc.
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
        // Show error message to user
      }}
      buttonText="Pay Now"
      buttonClassName="bg-green-600 hover:bg-green-700 text-white font-bold"
    />
  );
}
```

### Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| amount | number | ✓ | Amount in paise (100 = ₹1) |
| currency | string | | Currency code (default: INR) |
| receipt | string | ✓ | Unique receipt ID for order |
| description | string | | Order description for Razorpay |
| email | string | | Customer email for prefill |
| customerId | string | | Your internal customer ID |
| onSuccess | function | | Callback when payment succeeds |
| onError | function | | Callback when payment fails |
| buttonText | string | | Button label (default: "Proceed to Payment") |
| buttonClassName | string | | Tailwind CSS classes for button |

### Success Response
```typescript
{
  razorpay_order_id: "order_1c5831c...",
  razorpay_payment_id: "pay_1c5831c...",
  razorpay_signature: "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

## Testing

### Development Mode
1. Start the backend server:
   ```bash
   npm run dev  # Runs on http://localhost:3000
   ```

2. Backend server will also run on port 5000 (check server.ts)

3. Open frontend and click "Pay Now" button

4. Razorpay test modal will appear

5. Use test credentials:
   - **Card Number**: 4111 1111 1111 1111
   - **Expiry**: Any future date (e.g., 12/25)
   - **CVV**: Any 3 digits (e.g., 123)
   - **OTP**: Any 6 digits (e.g., 123456)

### Test Payment Flow
1. Click "Pay Now" button
2. Modal opens showing order details
3. Enter test card details above
4. Payment processes
5. On success:
   - "Payment successful!" message appears
   - Success callback is called with payment data
6. Backend verifies signature automatically

### Example Test Request (using curl)

**Create Order:**
```bash
curl -X POST http://localhost:5000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "test_receipt_123",
    "description": "Test payment",
    "email": "test@example.com"
  }'
```

**Verify Payment:**
```bash
curl -X POST http://localhost:5000/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_from_response",
    "razorpay_payment_id": "pay_from_response",
    "razorpay_signature": "signature_from_response"
  }'
```

## Integration Example: PaymentCheckoutPage

See `src/components/PaymentCheckoutPage.tsx` for a complete example showing:
- Order summary display
- Item list
- Tax and shipping calculation
- Total amount display
- Integrated RazorpayCheckout component

## Security Best Practices

### ✅ Implemented
- HMAC-SHA256 signature verification
- Secret key never reaches frontend
- Public key only in frontend env
- Credentials in .env (not in code)
- .env in .gitignore

### ✅ To Implement (in your app)
1. **Store verified payments** in database
2. **Validate receipt ID** hasn't been used before (prevent duplicates)
3. **Associate order** with logged-in user/customer
4. **Log all transactions** for audit trail
5. **Use HTTPS only** in production
6. **Regenerate receipt ID** for each payment attempt
7. **Handle edge cases**:
   - User closes modal without paying
   - Network failure during verification
   - Duplicate payment attempts
   - Timeout scenarios

### 🚫 Never Do
- Store or log `RAZORPAY_KEY_SECRET` anywhere
- Send secret key to frontend
- Skip signature verification
- Trust unverified payments
- Hardcode credentials in code

## Production Checklist

Before deploying to production:

1. **Switch credentials**
   - Generate live Razorpay keys (not test keys)
   - Update `.env` with live keys
   - Keep test keys for testing

2. **Environment setup**
   - Ensure `.env` file is NOT committed
   - Set environment variables on production server
   - Use secure secret management (AWS Secrets Manager, etc.)

3. **Database integration**
   - Add payment tracking to your orders table
   - Store `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
   - Add payment status field

4. **Error handling**
   - Implement proper error logging
   - Send error alerts to admin
   - Show user-friendly error messages

5. **Testing**
   - Test with test keys first
   - Test all edge cases (network failures, timeouts, etc.)
   - Load testing with concurrent payments

6. **Documentation**
   - Document callback URLs if webhooks are added
   - Document refund process
   - Document dispute handling

## Troubleshooting

### Issue: Razorpay script not loading
- Check browser console for CSP (Content Security Policy) errors
- Ensure checkout.razorpay.com is not blocked

### Issue: "Missing RAZORPAY_KEY_ID" error
- Check `.env` file exists and has correct key
- Restart development server after changing .env
- For frontend: verify `VITE_RAZORPAY_KEY_ID` is set

### Issue: Payment verification fails
- Check that `RAZORPAY_KEY_SECRET` is correct
- Ensure backend is receiving all three response fields
- Verify server is handling CORS properly

### Issue: Modal not opening
- Check browser console for errors
- Verify Razorpay script loaded successfully
- Check that `amount` >= 100 paise

### Issue: CORS errors
- Backend should allow requests from frontend origin
- Check Express CORS configuration
- Add CORS headers if needed

## Next Steps

1. **Integrate with orders table**
   - Add fields: razorpay_order_id, razorpay_payment_id, payment_status
   - Update on successful payment verification

2. **Add webhooks** (optional)
   - Listen for payment events from Razorpay
   - Auto-process orders on payment

3. **Add refunds**
   - Implement refund API using Razorpay SDK
   - Add refund UI in admin panel

4. **Add payment history**
   - Show past payments in user profile
   - Add payment receipts

5. **Multi-currency support**
   - Extend to support USD, EUR, etc.

## Documentation References

- [Razorpay Standard Checkout Docs](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Test Card Numbers](https://razorpay.com/docs/payments/payments/test-card-numbers/)
- [Razorpay Node.js SDK](https://github.com/razorpay/razorpay-node)

## Support

For issues:
1. Check Razorpay dashboard logs
2. Review browser console
3. Check server logs (terminal where npm run dev is running)
4. Verify .env configuration
5. Contact Razorpay support if payment processing issues persist
