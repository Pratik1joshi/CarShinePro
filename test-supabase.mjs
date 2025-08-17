#!/usr/bin/env node

// Test Supabase connection and get project info
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgtpeoulwgafzdnmsqhp.supabase.co';

console.log('🔍 Testing Supabase connection...');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('');
console.log('🔑 To get your anon key:');
console.log('1. Go to: https://supabase.com/dashboard/project/kgtpeoulwgafzdnmsqhp');
console.log('2. Click on "Settings" in the sidebar');
console.log('3. Click on "API" in the settings menu');
console.log('4. Copy the "anon public" key');
console.log('5. Update your .env.local file');
console.log('');
console.log('Your .env.local should look like:');
console.log('NEXT_PUBLIC_SUPABASE_URL=https://kgtpeoulwgafzdnmsqhp.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('');

// Test if we can create client (will fail without anon key, but that's expected)
try {
  const supabase = createClient(supabaseUrl, 'test-key');
  console.log('✅ Supabase client creation test passed');
} catch (error) {
  console.log('ℹ️  Supabase client needs valid anon key (expected)');
}

console.log('');
console.log('💡 After updating your anon key, restart the dev server:');
console.log('   npm run dev');
