-- Create the trigger that should have been created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Check current auth users and their profiles
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  p.user_id as profile_user_id,
  p.display_name,
  p.subscription_tier
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 3;