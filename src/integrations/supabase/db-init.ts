
import { supabase, createProfilesTableSql, createDriversTableSql } from './client';

// Instead of relying on an exec_sql function, we'll try to create tables directly using SQL queries
export const initializeDatabase = async () => {
  try {
    console.log('Attempting to initialize database tables...');
    
    let tablesCreated = false;
    
    try {
      // Check if profiles table exists
      console.log('Checking if profiles table exists...');
      const { data: profilesExist, error: profilesCheckError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      // If we get an error with code 42P01, the table doesn't exist
      if (profilesCheckError && profilesCheckError.code === '42P01') {
        console.log('Profiles table does not exist, attempting to create it...');
        
        try {
          // Direct SQL query to create the table
          const { error: createError } = await supabase.rpc('exec_sql', { 
            sql: createProfilesTableSql 
          });
          
          if (createError) {
            console.error('Failed to create profiles table:', createError);
            
            // Try alternative approach with REST API if RPC fails
            const { error: restCreateError } = await supabase
              .from('profiles')
              .insert([])
              .select();
            
            if (restCreateError && restCreateError.code !== '42P01') {
              console.error('Alternative approach failed:', restCreateError);
              throw new Error('Cannot create profiles table. Please create it manually in the Supabase dashboard.');
            } else {
              console.log('Successfully created profiles table via REST API');
              tablesCreated = true;
            }
          } else {
            console.log('Successfully created profiles table');
            tablesCreated = true;
          }
        } catch (sqlError) {
          console.error('Error executing SQL:', sqlError);
          throw new Error('Cannot create profiles table. Please create it manually in the Supabase dashboard.');
        }
      } else {
        console.log('Profiles table exists or different error occurred');
      }
      
      // Check if drivers table exists
      console.log('Checking if drivers table exists...');
      const { data: driversExist, error: driversCheckError } = await supabase
        .from('drivers')
        .select('id')
        .limit(1);
      
      // If we get an error with code 42P01, the table doesn't exist
      if (driversCheckError && driversCheckError.code === '42P01') {
        console.log('Drivers table does not exist, attempting to create it...');
        
        try {
          // Direct SQL query to create the table
          const { error: createError } = await supabase.rpc('exec_sql', { 
            sql: createDriversTableSql 
          });
          
          if (createError) {
            console.error('Failed to create drivers table:', createError);
            
            // Try alternative approach with REST API if RPC fails
            const { error: restCreateError } = await supabase
              .from('drivers')
              .insert([])
              .select();
            
            if (restCreateError && restCreateError.code !== '42P01') {
              console.error('Alternative approach failed:', restCreateError);
              throw new Error('Cannot create drivers table. Please create it manually in the Supabase dashboard.');
            } else {
              console.log('Successfully created drivers table via REST API');
              tablesCreated = true;
            }
          } else {
            console.log('Successfully created drivers table');
            tablesCreated = true;
          }
        } catch (sqlError) {
          console.error('Error executing SQL:', sqlError);
          throw new Error('Cannot create drivers table. Please create it manually in the Supabase dashboard.');
        }
      } else {
        console.log('Drivers table exists or different error occurred');
      }
      
      // Final verification
      const { error: finalProfilesCheck } = await supabase.from('profiles').select('id').limit(1);
      const { error: finalDriversCheck } = await supabase.from('drivers').select('id').limit(1);
      
      if ((finalProfilesCheck && finalProfilesCheck.code === '42P01') || 
          (finalDriversCheck && finalDriversCheck.code === '42P01')) {
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
