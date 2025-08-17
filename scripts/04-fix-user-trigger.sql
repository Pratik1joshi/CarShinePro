-- Fix the user creation trigger to handle metadata properly

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create an improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, is_admin)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and continue (prevents signup from failing)
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to get cart total (if not exists)
CREATE OR REPLACE FUNCTION get_cart_total(user_id UUID)
RETURNS TABLE(total DECIMAL, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(product_price * quantity), 0) as total,
    COALESCE(SUM(quantity), 0) as count
  FROM cart_items 
  WHERE cart_items.user_id = get_cart_total.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
