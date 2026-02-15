# PayPal Integration Setup Guide

This guide explains how to configure PayPal payments for the Harjun Raskaskone online shop.

## Overview

The shop is integrated with PayPal's JavaScript SDK, allowing customers to pay directly with PayPal or credit/debit cards through PayPal's secure checkout.

## Features

- **PayPal Button Integration**: Customers can pay with their PayPal account
- **Credit/Debit Card Support**: PayPal also processes card payments
- **Form Validation**: Customer information is validated before payment
- **EUR Currency**: All transactions in Euros
- **Finnish Localization**: PayPal interface in Finnish (`fi_FI`)
- **Invoice Fallback**: Customers can also choose to order with invoice

## Production Setup

### 1. Get PayPal Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Log in with your PayPal business account
3. Navigate to "My Apps & Credentials"
4. Switch to "Live" mode (not Sandbox)
5. Create a new app or use an existing one
6. Copy your **Live Client ID**

### 2. Update shop.html

Open `shop.html` and find this line (around line 13):

```html
<!-- PayPal SDK - IMPORTANT: Replace YOUR_PAYPAL_CLIENT_ID with your actual PayPal Client ID -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=EUR&locale=fi_FI"></script>
```

Replace `YOUR_PAYPAL_CLIENT_ID` with your actual PayPal Client ID:

```html
<script src="https://www.paypal.com/sdk/js?client-id=AeB1234567890XYZ&currency=EUR&locale=fi_FI"></script>
```

**Important**: 
- `YOUR_PAYPAL_CLIENT_ID` is a placeholder that must be replaced before deploying
- The shop checks the PayPal SDK script URL on load; if it still contains `YOUR_PAYPAL_CLIENT_ID` or the SDK fails to load, the PayPal buttons are hidden and the invoice fallback UI is shown with an error message
- Keep your Client ID safe - it's okay to use it in frontend code as PayPal designed it for that purpose

### 3. Test in Sandbox (Development)

For testing, you can use PayPal's sandbox:

1. Create a sandbox account at [PayPal Sandbox](https://developer.paypal.com/developer/accounts/)
2. Get your Sandbox Client ID
3. Use it for testing: `?client-id=YOUR_SANDBOX_CLIENT_ID`
4. Use sandbox test accounts for payments

### 4. Production Checklist

Before going live:

- [ ] Replace sandbox client ID with live client ID
- [ ] Test checkout flow with real PayPal account
- [ ] Verify EUR currency is working
- [ ] Test Finnish localization
- [ ] Ensure HTTPS is enabled on your site (required by PayPal)
- [ ] Set up webhook handlers (recommended for order tracking)
- [ ] Test mobile payment flow

## How It Works

### Payment Flow

1. Customer adds items to cart
2. Customer clicks "Siirry kassalle" (Go to checkout)
3. Customer fills in business information (required fields)
4. Customer can choose:
   - **Pay with PayPal**: Click PayPal button → Complete payment → Order confirmed
   - **Order with invoice**: Click "Tilaa laskulla" → Order submitted for manual processing

### PayPal Button Behavior

The PayPal button:
- Validates form fields before opening PayPal checkout
- Shows alert if required fields are missing
- Creates order with cart items and total
- Disables shipping (digital/service products)
- Captures payment immediately
- Shows success message with order number
- Clears cart after successful payment

### Order Data Logged

When payment succeeds, the following data is logged to console (in production, send this to your backend):

```javascript
{
  orderNumber: 'HRK-12345678-001',
  paypalOrderId: 'PAYPAL_ORDER_ID',
  paypalPayerId: 'PAYPAL_PAYER_ID',
  customer: {
    company: '...',
    businessId: '...',
    contactPerson: '...',
    phone: '...',
    email: '...',
    address: '...',
    postalCode: '...',
    city: '...',
    notes: '...'
  },
  items: [...],
  total: 214.00
}
```

## Backend Integration (Recommended)

Currently, orders are only logged to the browser console. For production, you should:

### 1. Create Backend Endpoint

Create a server endpoint to receive order data:

```javascript
// Example: POST /api/orders
app.post('/api/orders', async (req, res) => {
  const { orderNumber, paypalOrderId, customer, items, total } = req.body;
  
  // Save to database
  await db.orders.create({
    orderNumber,
    paypalOrderId,
    customer,
    items,
    total,
    status: 'paid'
  });
  
  // Send confirmation email
  await sendOrderConfirmation(customer.email, orderNumber);
  
  res.json({ success: true });
});
```

### 2. Update shop.html

In the `onApprove` callback (around line 2225-2249), add:

```javascript
// Send order to backend
await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderNumber,
    paypalOrderId: orderData.id,
    paypalPayerId: orderData.payer.payer_id,
    customer: customerData,
    items: cart,
    total: getCartTotal()
  })
});
```

### 3. Verify PayPal Webhook (Optional but Recommended)

Set up PayPal webhooks to track payment events:

1. Go to PayPal Developer Dashboard
2. Navigate to Webhooks
3. Add webhook URL: `https://yourdomain.com/api/paypal/webhook`
4. Subscribe to events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`
5. Verify webhook signatures in your backend

## Customization

### Change Currency

Edit the SDK URL in shop.html:

```html
?client-id=YOUR_CLIENT_ID&currency=USD&locale=en_US
```

Supported currencies: EUR, USD, GBP, SEK, NOK, DKK, etc.

### Change Button Style

Edit the `style` option in `initPayPalButtons()` (around line 2179):

```javascript
style: {
  layout: 'vertical',  // or 'horizontal'
  color: 'blue',       // 'gold', 'silver', 'white', 'black'
  shape: 'rect',       // or 'pill'
  label: 'paypal'      // or 'checkout', 'pay', 'buynow'
}
```

### Disable Invoice Option

If you want PayPal-only checkout, remove these lines from shop.html (around line 2123-2126):

```html
<div class="payment-divider">
  <span>tai</span>
</div>
<button type="submit" class="submit-order-btn">Tilaa laskulla</button>
```

## Troubleshooting

### PayPal Button Not Showing

**Problem**: Empty space where PayPal button should be

**Solutions**:
- Check browser console for errors
- Verify client ID is correct
- Ensure HTTPS is enabled
- Check if PayPal SDK loaded correctly
- Try disabling ad blockers

### "PayPal-maksu ei ole käytettävissä"

**Problem**: Error message appears instead of PayPal button

**Solutions**:
- This means PayPal SDK failed to load
- Check network tab for blocked requests
- Verify internet connection
- Check if site is on HTTPS
- Ensure no content blockers are active

### Form Validation Alert

**Problem**: "Täytä ensin kaikki pakolliset kentät" appears when clicking PayPal

**Solution**: This is intentional - all required form fields must be filled before payment

### Payment Captured but No Order Saved

**Problem**: Payment successful but order not in your system

**Solution**: Implement backend integration (see above) to save orders to database

## Security Notes

- ✅ Client ID is safe to expose (it's designed for frontend use)
- ❌ Never expose your Secret Key
- ✅ All payment processing happens on PayPal's servers
- ✅ No sensitive payment data touches your server
- ✅ PayPal handles PCI compliance
- ⚠️ Always verify webhook signatures in backend
- ⚠️ Always verify payment amounts server-side

## Support

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal JavaScript SDK Reference](https://developer.paypal.com/sdk/js/)
- [PayPal Integration Wizard](https://developer.paypal.com/integration-wizard/)
- [PayPal Community Forums](https://www.paypal-community.com/)

## Testing

### Sandbox Test Accounts

When testing in sandbox mode, use test accounts:

1. Create buyer and seller test accounts in sandbox
2. Use test credit cards provided by PayPal
3. Test both successful and failed payments
4. Verify order numbers are unique
5. Test with different amounts

### Production Testing

Before announcing the shop:

1. Make a small test purchase ($0.01 EUR if possible)
2. Verify payment appears in your PayPal account
3. Test refund process
4. Verify email notifications work
5. Test on mobile devices

## License

This integration uses PayPal's official JavaScript SDK. See [PayPal Developer Agreement](https://www.paypal.com/us/webapps/mpp/ua/legalhub-full).
