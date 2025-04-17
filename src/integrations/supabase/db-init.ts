
import { supabase, createProfilesTableSql, createDriversTableSql } from './client';

// Create the required tables if they don't exist
export const initializeDatabase = async () => {
  try {
    console.log('Attempting to initialize database tables...');
    
    // Directly attempt to run SQL
    let tablesCreated = false;
    
    try {
      // Check if profiles table exists
      console.log('Checking if profiles table exists...');
      const { data: profilesExist, error: profilesCheckError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      // If we get here without a 42P01 error, the table exists
      if (!profilesCheckError) {
        console.log('Profiles table exists');
      } else if (profilesCheckError.code === '42P01') {
        console.log('Profiles table does not exist, attempting to create it...');
        
        try {
          // Try to create the table using raw SQL via RPC
          const { error: createError } = await supabase.rpc('exec_sql', { 
            sql: createProfilesTableSql 
          });
          
          if (createError) {
            console.error('Failed to create profiles table:', createError);
            throw createError;
          } else {
            console.log('Successfully created profiles table');
            tablesCreated = true;
          }
        } catch (sqlError) {
          console.error('Error executing SQL:', sqlError);
          throw new Error('Cannot create profiles table. Please create it manually in the Supabase dashboard.');
        }
      }
      
      // Check if drivers table exists
      console.log('Checking if drivers table exists...');
      const { data: driversExist, error: driversCheckError } = await supabase
        .from('drivers')
        .select('id')
        .limit(1);
      
      // If we get here without a 42P01 error, the table exists
      if (!driversCheckError) {
        console.log('Drivers table exists');
      } else if (driversCheckError.code === '42P01') {
        console.log('Drivers table does not exist, attempting to create it...');
        
        try {
          // Try to create the table using raw SQL via RPC
          const { error: createError } = await supabase.rpc('exec_sql', { 
            sql: createDriversTableSql 
          });
          
          if (createError) {
            console.error('Failed to create drivers table:', createError);
            throw createError;
          } else {
            console.log('Successfully created drivers table');
            tablesCreated = true;
          }
        } catch (sqlError) {
          console.error('Error executing SQL:', sqlError);
          throw new Error('Cannot create drivers table. Please create it manually in the Supabase dashboard.');
        }
      }
      
      // Verify tables exist after creation attempts
      const { error: finalProfilesCheck } = await supabase.from('profiles').select('id').limit(1);
      const { error: finalDriversCheck } = await supabase.from('drivers').select('id').limit(1);
      
      if (finalProfilesCheck && finalProfilesCheck.code === '42P01' || 
          finalDriversCheck && finalDriversCheck.code === '42P01') {
        return { 
          success: false, 
          error: new Error('Tables could not be created automatically. Please create "profiles" and "drivers" tables manually in the Supabase dashboard.') 
        };
      }
      
      return { success: true, tablesCreated };
      
    } catch (error) {
      console.error('Error during table creation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error creating tables') 
      };
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error initializing database') 
    };
  }
};

// Call this function at app startup
export const setupDatabase = async () => {
  return await initializeDatabase();
};
