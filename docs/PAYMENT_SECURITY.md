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

### 4. Secure Admin Access Functions

**For Admin Monitoring** - `get_subscription_monitoring()`:
- Requires admin or super_admin role
- Returns subscription overview with Stripe IDs redacted as `[REDACTED]`
- Supports pagination with limit/offset parameters

**For Customer Support** - `get_user_subscription_admin()`:
- Requires super_admin role only
- Provides full access to Stripe customer IDs for support purposes
- **Every access is logged** to audit_logs with `ADMIN_VIEW_STRIPE_ID` action
- Use sparingly and only for legitimate customer support cases

### 5. Safe Data Access
**For Users** - `get_user_subscription_safe()`:
- Returns subscription status without exposing:
  - Stripe customer IDs
  - Internal record IDs
  - Metadata timestamps
- Automatically enforces user can only see their own data

### 6. Client-Side Protection
The `useSubscription` hook:
- Uses the safe RPC function instead of direct table queries
- Never logs full error objects (which might contain sensitive data)
- Only logs generic error messages

### 7. Edge Function Security
The `manage-subscription` edge function:
- Requires admin authorization for tier updates
- Sanitizes error messages in production
- Uses service role only for legitimate payment operations

## Access Tiers

### User Self-Service
- **Function**: `get_user_subscription_safe()`
- **Access Level**: Own data only
- **Returns**: Subscription status without Stripe IDs

### Admin Monitoring
- **Function**: `get_subscription_monitoring(limit, offset)`
- **Access Level**: Admins and super admins
- **Returns**: All subscriptions with redacted Stripe IDs

### Support Access (Logged)
- **Function**: `get_user_subscription_admin(user_id)`
- **Access Level**: Super admins only
- **Returns**: Complete subscription including Stripe customer ID
- **Important**: All access is logged to audit_logs

## Best Practices for Developers

### ✅ DO:
- Use `get_user_subscription_safe()` for user self-service
- Use `get_subscription_monitoring()` for admin dashboards (Stripe IDs redacted)
- Use `get_user_subscription_admin()` only for customer support (fully logged)
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
2. `get_subscription_monitoring()` function for admin oversight (Stripe IDs redacted)
3. Special audit log entries for `ADMIN_VIEW_STRIPE_ID` when super admins access Stripe data
4. Regular security scans

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

-- As an admin, this should return all subscriptions with redacted Stripe IDs
SELECT * FROM get_subscription_monitoring(50, 0);

-- As a super admin, this logs the access and returns full details
SELECT * FROM get_user_subscription_admin('user-uuid-here');

-- Verify the super admin access was logged
SELECT * FROM audit_logs WHERE action = 'ADMIN_VIEW_STRIPE_ID' ORDER BY created_at DESC LIMIT 5;
```

## Related Documentation
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
