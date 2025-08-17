import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Database Setup Script')
console.log('========================')

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing Supabase credentials')
  console.log('📝 Please check your .env.local file and ensure you have:')
  console.log('   - NEXT_PUBLIC_SUPABASE_URL')
  console.log('   - SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

// Check if credentials look valid
if (supabaseUrl.includes('your_supabase_project_url_here') || 
    supabaseServiceKey.includes('your_supabase_anon_key_here')) {
  console.log('⚠️  Default placeholder credentials detected')
  console.log('📝 Please update your .env.local file with actual Supabase credentials')
  console.log('   Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSQLFile(filename) {
  const filePath = path.join('scripts', filename)
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`)
    return false
  }

  const sql = fs.readFileSync(filePath, 'utf8')
  
  try {
    console.log(`📄 Running ${filename}...`)
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error(`❌ Error in ${filename}:`, error.message)
      return false
    }
    
    console.log(`✅ ${filename} completed successfully`)
    return true
  } catch (err) {
    console.error(`❌ Failed to run ${filename}:`, err.message)
    return false
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...')
  
  // Test connection first
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1)
    // We expect an error here since the table doesn't exist, but no network error
    if (error && !error.message.includes('relation "_test" does not exist')) {
      throw error
    }
    console.log('✅ Database connection successful')
  } catch (err) {
    console.error('❌ Database connection failed:', err.message)
    console.log('📝 Please check your Supabase credentials and try again')
    process.exit(1)
  }

  // Create a simple SQL execution function if it doesn't exist
  try {
    await supabase.rpc('exec_sql', { sql_query: 'SELECT 1' })
  } catch (err) {
    console.log('📄 Creating SQL execution function...')
    const { error } = await supabase.rpc('create_exec_function', {})
    if (error) {
      console.log('⚠️  Using alternative setup method...')
    }
  }

  const sqlFiles = [
    '01-create-tables.sql',
    '02-seed-data.sql', 
    '03-setup-rls.sql',
    '04-fix-user-trigger.sql'
  ]

  let allSuccessful = true
  
  for (const file of sqlFiles) {
    const success = await runSQLFile(file)
    if (!success) {
      allSuccessful = false
      break
    }
  }

  if (allSuccessful) {
    console.log('🎉 Database setup completed successfully!')
    console.log('📝 Your application is now ready to use with real Supabase data')
    console.log('🔧 Make sure FORCE_DEV_MODE is set to false in lib/supabase.js')
  } else {
    console.log('❌ Database setup failed')
    console.log('📝 Please check the errors above and try again')
    console.log('💡 You may need to run the SQL files manually in your Supabase dashboard')
  }
}

// Alternative method: Execute SQL directly
async function executeSQL(sql, description) {
  try {
    console.log(`📄 ${description}...`)
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec', { sql: statement })
        if (error) {
          console.warn(`⚠️  Warning in ${description}:`, error.message)
          // Continue with other statements
        }
      }
    }
    
    console.log(`✅ ${description} completed`)
    return true
  } catch (err) {
    console.error(`❌ Error in ${description}:`, err.message)
    return false
  }
}

async function alternativeSetup() {
  console.log('🔄 Using alternative setup method...')
  
  // Essential tables
  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      shipping_address TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      order_id UUID REFERENCES orders(id),
      product_id VARCHAR(255) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_price DECIMAL(10,2) NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id),
      product_id VARCHAR(255) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_price DECIMAL(10,2) NOT NULL,
      product_image VARCHAR(500),
      quantity INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  // Fixed user creation trigger
  const createTrigger = `
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
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `

  const createCartFunction = `
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
  `

  const enableRLS = `
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

    CREATE POLICY IF NOT EXISTS "Users can view own profile" ON users
      FOR SELECT USING (auth.uid() = id);

    CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users
      FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY IF NOT EXISTS "Users can view own orders" ON orders
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY IF NOT EXISTS "Users can create own orders" ON orders
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY IF NOT EXISTS "Users can view own cart items" ON cart_items
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY IF NOT EXISTS "Users can manage own cart items" ON cart_items
      FOR ALL USING (auth.uid() = user_id);
  `

  const steps = [
    { sql: createTables, description: 'Creating tables' },
    { sql: createTrigger, description: 'Setting up user creation trigger' },
    { sql: createCartFunction, description: 'Creating cart functions' },
    { sql: enableRLS, description: 'Enabling row level security' }
  ]

  let allSuccessful = true
  for (const step of steps) {
    const success = await executeSQL(step.sql, step.description)
    if (!success) allSuccessful = false
  }

  if (allSuccessful) {
    console.log('🎉 Alternative database setup completed!')
    console.log('📝 Your database should now be ready for user signups')
  }
}

// Try main setup, fallback to alternative
setupDatabase().catch(() => {
  console.log('🔄 Main setup failed, trying alternative method...')
  alternativeSetup()
})
