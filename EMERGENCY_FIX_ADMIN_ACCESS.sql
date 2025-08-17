-- ============================================
-- EMERGENCY: FIX ADMIN ACCESS ISSUE
-- ============================================

-- STEP 1: Temporarily disable RLS on users table to regain access
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- STEP 2: Verify admin user exists and is marked as admin
SELECT 'Current admin user status:' as step;
SELECT id, email, full_name, is_admin, created_at 
FROM users 
WHERE id = '0df5176d-f531-4a80-95b7-b2628f47b655' OR email = 'jc555@gmail.com';

-- STEP 3: Force set admin status
UPDATE users 
SET is_admin = true 
WHERE id = '0df5176d-f531-4a80-95b7-b2628f47b655' OR email = 'jc555@gmail.com';

-- STEP 4: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- STEP 5: Drop the problematic admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- STEP 6: Create a simpler admin policy that works
-- This uses a direct user ID check instead of a subquery
CREATE POLICY "Admin user can view all users" ON users
FOR SELECT USING (
  auth.uid() = '0df5176d-f531-4a80-95b7-b2628f47b655'::uuid
);

CREATE POLICY "Admin user can update all users" ON users  
FOR UPDATE USING (
  auth.uid() = '0df5176d-f531-4a80-95b7-b2628f47b655'::uuid
);

-- STEP 7: Test admin access
SELECT 'Testing admin access after fix:' as step;
SELECT COUNT(*) as total_users FROM users;

-- STEP 8: Show all users to verify it works
SELECT 'All users visible to admin:' as step;
SELECT id, email, full_name, is_admin, created_at 
FROM users 
ORDER BY created_at DESC;
