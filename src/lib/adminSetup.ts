import { supabase } from './supabaseClient';

/**
 * Initialize admin account - This should be run once via Supabase admin API
 * Requires: service_role key (NOT anonKey)
 * 
 * Usage: Run this function in Supabase SQL editor or via admin backend
 */
export async function initializeAdminAccount() {
  try {
    console.log('Initializing admin account...');
    
    // First, check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'info@metricfluxsolutions.com')
      .single();

    if (existingAdmin) {
      console.log('Admin account already exists');
      return { success: true, message: 'Admin already initialized' };
    }

    console.log('Admin account not found. Please create it via Supabase dashboard or use admin API.');
    return { success: false, message: 'Admin account needs to be created via admin API' };
  } catch (error: any) {
    console.error('Admin initialization error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * SQL to execute in Supabase dashboard to create admin account:
 * 
 * NOTE: This requires the service_role key or admin API
 * 
 * Steps:
 * 1. Go to Supabase Dashboard > SQL Editor
 * 2. Create a new query
 * 3. Execute the admin creation stored procedure (if available)
 * 4. Or manually insert into auth.users and profiles tables
 */
export const ADMIN_SETUP_SQL = `
-- This SQL should be executed by an admin user or via admin API
-- It creates the admin account for info@metricfluxsolutions.com

-- First create in auth.users (requires service_role key - do this via dashboard or admin API)
-- Then run this to create the profile entry:

INSERT INTO public.profiles (
  id,
  email,
  name,
  phone,
  role,
  email_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- Replace with actual UUID from auth.users
  'info@metricfluxsolutions.com',
  'JOSNA JOSE',
  NULL,
  'ADMIN',
  true,
  now(),
  now()
)
ON CONFLICT DO NOTHING;
`;

export default initializeAdminAccount;
