-- Check if the trigger exists for new user creation
-- First, let's see what triggers are on the auth.users table
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth';

-- If no trigger exists, create it to handle new user profile creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users' 
    AND event_object_schema = 'auth'
  ) THEN
    -- Create trigger to automatically create profile when user signs up
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;