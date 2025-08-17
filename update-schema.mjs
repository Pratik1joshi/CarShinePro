import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase credentials not found in .env.local')
  console.log('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateOrdersSchema() {
  console.log('🔄 Updating orders table schema...')
  
  try {
    // Add customer_name column
    const { error: error1 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);'
    })
    if (error1) console.log('customer_name:', error1.message)

    // Add customer_email column
    const { error: error2 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);'
    })
    if (error2) console.log('customer_email:', error2.message)

    // Add customer_phone column
    const { error: error3 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);'
    })
    if (error3) console.log('customer_phone:', error3.message)

    // Add delivery_address column
    const { error: error4 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address JSONB;'
    })
    if (error4) console.log('delivery_address:', error4.message)

    // Add subtotal column
    const { error: error5 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);'
    })
    if (error5) console.log('subtotal:', error5.message)

    // Add delivery_charge column
    const { error: error6 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2);'
    })
    if (error6) console.log('delivery_charge:', error6.message)

    // Add payment_method column
    const { error: error7 } = await supabase.rpc('sql', {
      query: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cod';"
    })
    if (error7) console.log('payment_method:', error7.message)

    // Add total_price column to order_items
    const { error: error8 } = await supabase.rpc('sql', {
      query: 'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);'
    })
    if (error8) console.log('order_items total_price:', error8.message)

    console.log('✅ Schema update completed!')
    
    // Test if we can now insert an order
    console.log('🧪 Testing order creation...')
    const testOrder = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '9812345678',
      delivery_address: { test: 'address' },
      subtotal: 100.00,
      delivery_charge: 150.00,
      total_amount: 250.00,
      payment_method: 'cod',
      status: 'pending'
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()

    if (error) {
      console.log('❌ Test order creation failed:', error.message)
    } else {
      console.log('✅ Test order created successfully!')
      
      // Clean up test order
      await supabase
        .from('orders')
        .delete()
        .eq('id', data[0].id)
      console.log('🧹 Test order cleaned up')
    }

  } catch (error) {
    console.error('❌ Error updating schema:', error.message)
  }
}

// Alternative method using direct SQL execution if RPC doesn't work
async function updateOrdersSchemaDirectSQL() {
  console.log('🔄 Trying direct SQL execution...')
  
  const sqlCommands = [
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address JSONB;',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);',
    'ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2);',
    "ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cod';",
    'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);'
  ]

  for (const sql of sqlCommands) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ query: sql })
      })

      if (!response.ok) {
        const error = await response.text()
        console.log(`SQL: ${sql} - Error: ${error}`)
      } else {
        console.log(`✅ Executed: ${sql.substring(0, 50)}...`)
      }
    } catch (error) {
      console.log(`❌ Failed: ${sql} - ${error.message}`)
    }
  }
}

async function main() {
  console.log('🚀 Starting database schema update...')
  console.log(`📡 Connecting to: ${supabaseUrl}`)
  
  // Try RPC method first
  await updateOrdersSchema()
  
  // If that doesn't work, try direct SQL
  // await updateOrdersSchemaDirectSQL()
  
  console.log('🎉 Database update process completed!')
  console.log('💡 You can now try placing an order in your application.')
}

main().catch(console.error)
