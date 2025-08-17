-- ============================================
-- SUPABASE DATABASE SCHEMA UPDATE
-- ============================================
-- Copy and paste these commands into the Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)

-- First, remove foreign key constraint on order_items.product_id since we use static products
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Also remove foreign key constraint on cart_items.product_id if it exists
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;

-- Update orders table to support new checkout fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS delivery_address JSONB,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cod';

-- Update order_items table (note: product_name, product_price, and price already exist in original schema)
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Also verify order_items table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;
