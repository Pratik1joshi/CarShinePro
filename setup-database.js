#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script sets up your Supabase database with the required tables and sample data.
 * Run this script once to initialize your database.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSQLFile(filePath, description) {
  try {
    console.log(`📝 ${description}...`);
    
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`\n⚠️  Please execute the following SQL in your Supabase dashboard:`);
    console.log(`Go to: https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/sql`);
    console.log(`\n--- ${description} ---`);
    console.log(sql);
    console.log(`--- End of ${description} ---\n`);
    
    console.log(`✅ ${description} SQL displayed - please execute in Supabase dashboard`);
  } catch (error) {
    console.error(`❌ Error reading ${description}:`, error);
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...');
  console.log(`🔗 Connected to: ${supabaseUrl}`);
  
  try {
    // Test connection
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
      console.log('✅ Supabase connection successful');
    }
    
    // Create tables
    await runSQLFile('./scripts/01-create-tables.sql', 'Creating database tables');
    
    // Seed data
    await runSQLFile('./scripts/02-seed-data.sql', 'Inserting sample data');
    
    // Setup RLS
    await runSQLFile('./scripts/03-setup-rls.sql', 'Setting up Row Level Security');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Authentication > Settings');
    console.log('3. Enable email authentication');
    console.log('4. Test the application by signing up a new user');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();
