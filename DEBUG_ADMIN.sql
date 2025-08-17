-- ============================================
-- ADMIN USER SETUP & DEBUGGING
-- ============================================
-- Run these queries in Supabase SQL Editor to debug admin access

-- 1. Check current users and their admin status
SELECT id, email, full_name, is_admin, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. Check if there are any orders in the database
SELECT id, user_id, customer_name, customer_email, total_amount, status, created_at 
FROM orders 
ORDER BY created_at DESC;

-- 3. Check order items
SELECT oi.*, o.customer_name 
FROM order_items oi 
JOIN orders o ON oi.order_id = o.id 
ORDER BY oi.order_id;

-- 4. Make a specific user admin (replace 'your-email@example.com' with your admin email)
-- UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';

-- 5. Check RLS policies are working - this should show all orders if you're admin
SELECT * FROM orders ORDER BY created_at DESC;

-- 6. Test admin policy specifically
SELECT 
  auth.uid() as current_user_id,
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  ) as is_admin_check;

-- UNCOMMENT AND MODIFY THIS LINE TO MAKE YOUR USER AN ADMIN:
-- UPDATE users SET is_admin = true WHERE email = 'PUT-YOUR-EMAIL-HERE@example.com';
