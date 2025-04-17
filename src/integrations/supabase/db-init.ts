
import { supabase, createProfilesTableSql, createDriversTableSql } from './client';

// Create the required tables if they don't exist
export const initializeDatabase = async () => {
  try {
    // Check if profiles table exists
    const { error: profilesCheckError } = await supabase.from('profiles').select('id').limit(1);
    
    if (profilesCheckError && profilesCheckError.code === '42P01') {
      console.log('Creating profiles table...');
      // Create profiles table using SQL
      const { error: createProfilesError } = await supabase.rpc('exec_sql', { sql: createProfilesTableSql });
      if (createProfilesError) {
        console.error('Error creating profiles table:', createProfilesError);
        throw createProfilesError;
      }
    }
    
    // Check if drivers table exists
    const { error: driversCheckError } = await supabase.from('drivers').select('id').limit(1);
    
    if (driversCheckError && driversCheckError.code === '42P01') {
      console.log('Creating drivers table...');
      // Create drivers table using SQL
      const { error: createDriversError } = await supabase.rpc('exec_sql', { sql: createDriversTableSql });
      if (createDriversError) {
        console.error('Error creating drivers table:', createDriversError);
        throw createDriversError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error };
  }
};

// Call this function at app startup
export const setupDatabase = async () => {
  return await initializeDatabase();
};
