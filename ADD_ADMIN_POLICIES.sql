-- ============================================
-- ADD MISSING ADMIN RLS POLICIES
-- ============================================

-- 1. First, make sure your user is admin
INSERT INTO users (id, email, full_name, is_admin)
VALUES (
  '0df5176d-f531-4a80-95b7-b2628f47b655',
  'jc555@gmail.com',
  'Admin User',
  true
) 
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;

-- 2. Add admin policy for orders (view all orders)
CREATE POLICY "Admins can view all orders" ON orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- 3. Add admin policy for order_items (view all order items)
CREATE POLICY "Admins can view all order items" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- 4. Add admin policy for orders (update orders)
CREATE POLICY "Admins can update orders" ON orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- 5. Add admin policy for users (view all users)
CREATE POLICY "Admins can view all users" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- 6. Add admin policy for users (update users)
CREATE POLICY "Admins can update users" ON users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- 7. Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'users') 
ORDER BY tablename, policyname;

-- 8. Test that admin can now see all orders
SELECT 'Testing admin access to orders:' as test;
SELECT id, user_id, customer_name, customer_email, total_amount, status, created_at 
FROM orders 
ORDER BY created_at DESC;

-- 9. Test that admin can now see all users  
SELECT 'Testing admin access to users:' as test;
SELECT id, email, full_name, is_admin, created_at 
FROM users 
ORDER BY created_at DESC;
