-- ============================================
-- COMPREHENSIVE ADMIN ACCESS DEBUG & FIX
-- ============================================

-- 1. Create a helper function to check auth context
CREATE OR REPLACE FUNCTION auth_uid_check()
RETURNS TABLE(
  current_uid UUID,
  user_exists BOOLEAN,
  is_admin_user BOOLEAN
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() as current_uid,
    EXISTS(SELECT 1 FROM users WHERE id = auth.uid()) as user_exists,
    COALESCE((SELECT is_admin FROM users WHERE id = auth.uid()), false) as is_admin_user;
$$;

-- 2. Check current auth context
SELECT * FROM auth_uid_check();

-- 1. Check if user exists in users table
SELECT 'User existence check:' as step;
SELECT id, email, full_name, is_admin, created_at 
FROM users 
WHERE email = 'jc555@gmail.com' OR id = '0df5176d-f531-4a80-95b7-b2628f47b655';

-- 2. Check all users to see the structure
SELECT 'All users in database:' as step;
SELECT id, email, full_name, is_admin, created_at 
FROM users 
ORDER BY created_at DESC;

-- 3. Insert/Update admin user (force it)
SELECT 'Setting admin status:' as step;
INSERT INTO users (id, email, full_name, is_admin)
VALUES (
  '0df5176d-f531-4a80-95b7-b2628f47b655',
  'jc555@gmail.com',
  'Admin User',
  true
) 
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  email = 'jc555@gmail.com';

-- 4. Double-check the user is now admin
SELECT 'Admin status verification:' as step;
SELECT id, email, full_name, is_admin 
FROM users 
WHERE id = '0df5176d-f531-4a80-95b7-b2628f47b655';

-- 5. Check all orders in database (bypass RLS temporarily)
SELECT 'All orders in database (raw):' as step;
SELECT id, user_id, customer_name, customer_email, total_amount, status, created_at 
FROM orders 
ORDER BY created_at DESC;

-- 6. Test RLS policy manually
SELECT 'Testing RLS policy:' as step;
SELECT 
  auth.uid() as current_auth_uid,
  (SELECT is_admin FROM users WHERE id = auth.uid()) as current_user_admin_status,
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  ) as rls_admin_check;

-- 7. Try to disable RLS temporarily to test (DANGER: Only for testing)
-- UNCOMMENT THESE LINES ONLY FOR TESTING:
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
-- SELECT 'Orders with RLS disabled:' as step;
-- SELECT * FROM orders;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
