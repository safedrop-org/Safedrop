
import { supabase, createProfilesTableSql, createDriversTableSql } from './client';

// Create the required tables if they don't exist
export const initializeDatabase = async () => {
  try {
    console.log('Attempting to initialize database tables...');
    
    // Check if profiles table exists
    console.log('Checking if profiles table exists...');
    const { error: profilesCheckError } = await supabase.from('profiles').select('id').limit(1);
    
    if (profilesCheckError && profilesCheckError.code === '42P01') {
      console.log('Profiles table does not exist, attempting to create it...');
      
      // Create profiles table - using direct API rather than SQL
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({}) // This will fail but helps to create the table
        .select();
      
      if (createProfileError && !createProfileError.message.includes('already exists')) {
        // Create profiles table schema manually
        console.log('Creating profiles table manually...');
        
        // Let the user know they need to create tables manually in Supabase dashboard
        console.warn('Please create the following tables in your Supabase dashboard:');
        console.warn('1. profiles table with schema:', createProfilesTableSql);
        console.warn('2. drivers table with schema:', createDriversTableSql);
      }
    }
    
    // Check if drivers table exists
    console.log('Checking if drivers table exists...');
    const { error: driversCheckError } = await supabase.from('drivers').select('id').limit(1);
    
    if (driversCheckError && driversCheckError.code === '42P01') {
      console.log('Drivers table does not exist, attempting to create it...');
      
      // Create drivers table - using direct API rather than SQL
      const { error: createDriverError } = await supabase
        .from('drivers')
        .insert({}) // This will fail but helps to create the table
        .select();
      
      if (createDriverError && !createDriverError.message.includes('already exists')) {
        // Let the user know they need to create this table manually
        console.warn('Please create drivers table manually in Supabase dashboard');
      }
    }
    
    // Final check to see if tables exist now
    const { error: finalProfilesCheck } = await supabase.from('profiles').select('id').limit(1);
    const { error: finalDriversCheck } = await supabase.from('drivers').select('id').limit(1);
    
    if (finalProfilesCheck && finalProfilesCheck.code === '42P01' || 
        finalDriversCheck && finalDriversCheck.code === '42P01') {
      return { 
        success: false, 
        error: new Error('Tables could not be created automatically. Please create "profiles" and "drivers" tables manually in the Supabase dashboard.') 
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
