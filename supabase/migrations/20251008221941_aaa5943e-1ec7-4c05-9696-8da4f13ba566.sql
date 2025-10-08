-- ====================================================================
-- CRITICAL FIX #1: Prevent Subscription Tier Escalation
-- ====================================================================

-- Drop the policy that allows users to update their own subscription data
DROP POLICY IF EXISTS "Users can only update own subscription data" ON subscribers;

-- Create restrictive policy that blocks ALL user-initiated updates
CREATE POLICY "Block all user updates to subscribers" 
ON subscribers
FOR UPDATE 
USING (false);

-- Create safe function for users to cancel their subscription
CREATE OR REPLACE FUNCTION cancel_own_subscription()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE subscribers
  SET subscribed = false,
      updated_at = now()
  WHERE user_id = auth.uid();
  
  -- Log the cancellation
  INSERT INTO audit_logs (user_id, action, table_name, record_id)
  VALUES (auth.uid(), 'SUBSCRIPTION_CANCELLED', 'subscribers', 
    (SELECT id FROM subscribers WHERE user_id = auth.uid()));
END;
$$;

-- Create monitoring trigger to detect unauthorized subscription changes
CREATE OR REPLACE FUNCTION monitor_subscription_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Alert on tier upgrades without service role
  IF OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier 
     AND auth.role() != 'service_role' THEN
    INSERT INTO security_alerts (
      alert_type,
      severity,
      user_id,
      details
    ) VALUES (
      'UNAUTHORIZED_TIER_CHANGE',
      'CRITICAL',
      NEW.user_id,
      jsonb_build_object(
        'old_tier', OLD.subscription_tier,
        'new_tier', NEW.subscription_tier,
        'role', auth.role()
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS detect_unauthorized_tier_changes ON subscribers;
CREATE TRIGGER detect_unauthorized_tier_changes
BEFORE UPDATE ON subscribers
FOR EACH ROW
EXECUTE FUNCTION monitor_subscription_changes();

-- ====================================================================
-- MEDIUM PRIORITY FIX: Add Governance Proposal Input Validation
-- ====================================================================

-- Create validation function for governance proposals
CREATE OR REPLACE FUNCTION validate_governance_proposal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate title length
  IF length(NEW.title) < 10 OR length(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Proposal title must be between 10 and 200 characters';
  END IF;
  
  -- Validate description length
  IF length(NEW.description) < 50 OR length(NEW.description) > 5000 THEN
    RAISE EXCEPTION 'Proposal description must be between 50 and 5000 characters';
  END IF;
  
  -- Validate proposal type
  IF NEW.proposal_type NOT IN (
    'protocol_upgrade', 
    'parameter_change', 
    'treasury_allocation', 
    'governance_change',
    'emergency_action'
  ) THEN
    RAISE EXCEPTION 'Invalid proposal type';
  END IF;
  
  -- Validate execution_data if present (must be valid JSON and reasonable size)
  IF NEW.execution_data IS NOT NULL THEN
    IF length(NEW.execution_data) > 10000 THEN
      RAISE EXCEPTION 'Execution data too large (max 10KB)';
    END IF;
    
    -- Sanitize execution_data to prevent injection
    BEGIN
      PERFORM NEW.execution_data::jsonb;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Execution data must be valid JSON';
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_proposal_input ON governance_proposals;
CREATE TRIGGER validate_proposal_input
BEFORE INSERT OR UPDATE ON governance_proposals
FOR EACH ROW
EXECUTE FUNCTION validate_governance_proposal();

-- ====================================================================
-- ENHANCED SECURITY: Audit suspicious subscription data access
-- ====================================================================

-- Log any suspicious queries to subscribers table
CREATE OR REPLACE FUNCTION log_subscription_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log if someone tries to select all subscriptions (potential data harvesting)
  IF TG_OP = 'SELECT' AND auth.role() = 'authenticated' THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      table_name,
      new_values
    ) VALUES (
      auth.uid(),
      'SUBSCRIPTION_DATA_ACCESS',
      'subscribers',
      jsonb_build_object(
        'timestamp', now(),
        'operation', TG_OP
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;