
import { supabase, createProfilesTableSql, createDriversTableSql } from './client';

// Create the required tables if they don't exist
export const initializeDatabase = async () => {
  try {
    // First try to create profiles table directly with SQL query
    console.log('Trying to create profiles table...');
    
    const { data: profilesData, error: createProfilesError } = await supabase
      .rpc('exec_sql', { sql: createProfilesTableSql })
      .single();
    
    if (createProfilesError) {
      console.error('Error creating profiles table:', createProfilesError);
      // If error is not about table already existing, log it
      if (!createProfilesError.message?.includes('already exists')) {
        console.error('Profiles table creation error:', createProfilesError);
      }
    }
    
    // Try to create drivers table directly with SQL query
    console.log('Trying to create drivers table...');
    
    const { data: driversData, error: createDriversError } = await supabase
      .rpc('exec_sql', { sql: createDriversTableSql })
      .single();
    
    if (createDriversError) {
      console.error('Error creating drivers table:', createDriversError);
      // If error is not about table already existing, log it
      if (!createDriversError.message?.includes('already exists')) {
        console.error('Drivers table creation error:', createDriversError);
      }
    }
    
    // Now check if the tables exist by querying them
    const { error: profilesCheckError } = await supabase.from('profiles').select('id').limit(1);
    const { error: driversCheckError } = await supabase.from('drivers').select('id').limit(1);
    
    if (profilesCheckError && profilesCheckError.code === '42P01') {
      // Still doesn't exist, try a different approach - create table via Supabase UI
      return { 
        success: false, 
        error: new Error('Unable to create tables automatically. Please create them manually in the Supabase dashboard.') 
      };
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
