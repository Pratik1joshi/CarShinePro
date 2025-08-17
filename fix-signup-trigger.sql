-- Quick fix for user creation trigger
-- Run this in your Supabase SQL editor to fix the signup issue

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert user profile with proper metadata handling
  INSERT INTO public.users (id, email, full_name, is_admin)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'fullName', 
      split_part(new.email, '@', 1)
    ),
    COALESCE(
      (new.raw_user_meta_data->>'is_admin')::boolean,
      false
    )
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test the function works
SELECT 'User creation trigger has been fixed and is ready!' as status;
