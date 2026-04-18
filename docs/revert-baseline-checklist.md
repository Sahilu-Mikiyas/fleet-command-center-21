# Revert Baseline Checklist

Use this checklist to confirm the repository is back to the pre-homepage baseline before introducing the final polished homepage.

## Expected baseline

- Root route redirects to `/dashboard`
- No `LandingPage` route
- No `/pay-order` route
- No public unauthenticated order/payment helper methods

## Verify quickly

1. Open `src/App.tsx` and confirm `/` redirects to `/dashboard`.
2. Confirm there are no routes for `/home`, `/landing`, or `/pay-order`.
3. Confirm `ordersApi` does not expose `getOrderPublicStatus`.
4. Confirm `paymentsApi` does not expose `initializePublicPayment`.
