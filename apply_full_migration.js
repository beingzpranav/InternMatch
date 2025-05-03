// This script applies the full migration to the Supabase database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables if needed
require('dotenv').config();

// Supabase URL and key should be set as environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set.');
  console.error('Please set these variables in .env file or in your environment.');
  process.exit(1);
}

// Initialize Supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFullMigration() {
  try {
    console.log('Starting full database migration...');
    
    // Read the full migration SQL file
    const migrationFilePath = path.join(__dirname, 'supabase', 'migrations', 'full_migration.sql');
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Split the SQL into individual statements for better error handling
    const statements = migrationSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Execute the SQL statement using the Supabase client
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.error('Statement:', statement);
        } else {
          console.log(`Successfully executed statement ${i + 1}.`);
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err);
        console.error('Statement:', statement);
      }
    }
    
    console.log('Full migration completed successfully!');
  } catch (error) {
    console.error('Error applying full migration:', error);
    process.exit(1);
  }
}

// Run the migration
applyFullMigration(); 