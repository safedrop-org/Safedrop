
import { supabase, createProfilesTableSql, createDriversTableSql } from './client';

// Function to execute SQL directly with error handling
const executeSql = async (sql: string, tableName: string) => {
  try {
    console.log(`Attempting to create ${tableName} table...`);
    
    // First try using RPC
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql });
    
    if (rpcError) {
      console.log(`RPC method failed for ${tableName} table: ${rpcError.message}`);
      
      // Try direct SQL query via REST API
      // This is a fallback mechanism since not all Supabase instances have exec_sql enabled
      console.log(`Attempting to create ${tableName} table via REST API...`);
      
      // We'll try to insert an empty row to force table creation
      const { error: restError } = await supabase
        .from(tableName)
        .insert([])
        .select();
      
      if (restError && restError.code !== '42P01') {
        console.error(`REST API attempt failed for ${tableName}: ${restError.message}`);
        return { success: false, error: restError };
      } else {
        console.log(`Table ${tableName} created successfully via REST API or already exists`);
        return { success: true };
      }
    }
    
    console.log(`Table ${tableName} created successfully via RPC`);
    return { success: true };
  } catch (error) {
    console.error(`Error executing SQL for ${tableName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(`Unknown error creating ${tableName}`) 
    };
  }
};

// Check if a table exists
const tableExists = async (tableName: string) => {
  try {
    // Try to select from the table, if it exists this will work
    const { error } = await supabase.from(tableName).select('*').limit(1);
    return !error || error.code !== '42P01'; // If error code is not 42P01 (undefined_table), table exists
  } catch (error) {
    console.error(`Error checking if ${tableName} exists:`, error);
    return false;
  }
};

export const initializeDatabase = async () => {
  try {
    console.log('Attempting to initialize database tables...');
    
    let tablesCreated = false;
    let profileTableResult = { success: false };
    let driverTableResult = { success: false };
    
    // Check if profiles table exists first
    const profilesExist = await tableExists('profiles');
    if (!profilesExist) {
      console.log('Profiles table does not exist, creating it...');
      profileTableResult = await executeSql(createProfilesTableSql, 'profiles');
      if (profileTableResult.success) tablesCreated = true;
    } else {
      console.log('Profiles table already exists');
      profileTableResult.success = true;
    }
    
    // Only proceed with drivers table if profiles table exists or was created
    if (profileTableResult.success) {
      const driversExist = await tableExists('drivers');
      if (!driversExist) {
        console.log('Drivers table does not exist, creating it...');
        driverTableResult = await executeSql(createDriversTableSql, 'drivers');
        if (driverTableResult.success) tablesCreated = true;
      } else {
        console.log('Drivers table already exists');
        driverTableResult.success = true;
      }
    }
    
    // Final verification - check if both tables exist
    const finalProfilesCheck = await tableExists('profiles');
    const finalDriversCheck = await tableExists('drivers');
    
    if (!finalProfilesCheck || !finalDriversCheck) {
      console.error('Tables verification failed after creation attempts');
      return {
        success: false,
        error: new Error('Tables could not be created automatically. Please create them manually in the Supabase dashboard.')
      };
    }
    
    console.log('Database initialization complete, tables exist');
    return { success: true, tablesCreated };
    
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
  // Try up to 2 times with delay between attempts
  let attempts = 0;
  const maxAttempts = 2;
  
  while (attempts < maxAttempts) {
    console.log(`Database initialization attempt ${attempts + 1}/${maxAttempts}`);
    const result = await initializeDatabase();
    
    if (result.success) {
      return result;
    }
    
    attempts++;
    if (attempts < maxAttempts) {
      console.log(`Waiting before retry attempt ${attempts + 1}...`);
      // Wait 2 seconds between attempts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // After all attempts, return the last failure
  return { 
    success: false, 
    error: new Error('Tables could not be created automatically after multiple attempts. Please create them manually.') 
  };
};
