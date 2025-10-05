# Payment Data Security - Subscribers Table

## Overview
The `subscribers` table contains sensitive payment information including Stripe customer IDs. This document outlines the security measures in place to protect this data.

## Security Measures Implemented

### 1. Row-Level Security (RLS) Policies
All access to the `subscribers` table is controlled by strict RLS policies:

- **Block anonymous access**: Anonymous users have zero access
- **User isolation**: Users can only view/modify their own subscription data
- **Service role access**: Only the service role (for webhooks and admin operations) has full access

### 2. Stripe Customer ID Protection
- **Never logged**: The `stripe_customer_id` field is explicitly excluded from all audit logs
- **Never exposed in errors**: Edge functions sanitize error messages to prevent leakage
- **Redacted in monitoring**: Admin monitoring views show `[REDACTED]` instead of actual IDs

### 3. Audit Trail
Every modification to subscription data is logged:
- `SUBSCRIPTION_CREATED` - When a new subscription is created
- `SUBSCRIPTION_UPDATED` - When subscription details change
- `SUBSCRIPTION_DELETED` - When a subscription is removed

**Important**: Stripe customer IDs are never included in audit logs.

### 4. Safe Data Access
The `get_user_subscription_safe()` function provides secure access to subscription status without exposing:
- Stripe customer IDs
- Internal record IDs
- Metadata timestamps

### 5. Client-Side Protection
The `useSubscription` hook:
- Uses the safe RPC function instead of direct table queries
- Never logs full error objects (which might contain sensitive data)
- Only logs generic error messages

### 6. Edge Function Security
The `manage-subscription` edge function:
- Requires admin authorization for tier updates
- Sanitizes error messages in production
- Uses service role only for legitimate payment operations

## Best Practices for Developers

### ✅ DO:
- Always use `get_user_subscription_safe()` for checking subscription status
- Log only generic error messages
- Use the service role only in edge functions for payment operations
- Test RLS policies regularly

### ❌ DON'T:
- Never query the `subscribers` table directly from client code
- Never log Stripe customer IDs
- Never expose Stripe data in error messages
- Never disable RLS policies on this table
- Never use `SELECT *` on subscribers table

## Monitoring

All access to subscription data is monitored via:
1. Audit log triggers that record all modifications
2. The `subscription_monitoring` view for admin oversight (with redacted Stripe IDs)
3. Regular security scans

## Emergency Response

If you suspect a breach:
1. Check audit logs for unauthorized access patterns
2. Review edge function logs for suspicious activity
3. Verify RLS policies are active
4. Rotate Stripe API keys if needed

## Testing RLS Policies

To verify policies are working:
```sql
-- As a regular user, this should only return your own data
SELECT * FROM get_user_subscription_safe();

-- As a regular user, this should return 0 rows for other users
SELECT * FROM subscribers WHERE user_id != auth.uid();
```

## Related Documentation
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
