// Script to apply notification system to Supabase
// Run with: node scripts/apply_notification_system.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are defined
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase environment variables are not defined.');
  console.error('Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read SQL migration files
const messagePermissionsPath = path.join(__dirname, '../supabase/migrations/message_permissions.sql');
const notificationSystemPath = path.join(__dirname, '../supabase/migrations/notification_system.sql');

const messagePermissionsSQL = fs.readFileSync(messagePermissionsPath, 'utf8');
const notificationSystemSQL = fs.readFileSync(notificationSystemPath, 'utf8');

// Apply migrations
async function applyMigrations() {
  try {
    console.log('Applying message permissions...');
    const { error: messagePermissionsError } = await supabase.rpc('pg_query', { 
      query_text: messagePermissionsSQL 
    });
    
    if (messagePermissionsError) {
      console.error('Error applying message permissions:', messagePermissionsError);
    } else {
      console.log('✓ Message permissions applied successfully');
    }

    console.log('Applying notification system...');
    const { error: notificationSystemError } = await supabase.rpc('pg_query', { 
      query_text: notificationSystemSQL 
    });
    
    if (notificationSystemError) {
      console.error('Error applying notification system:', notificationSystemError);
    } else {
      console.log('✓ Notification system applied successfully');
    }

    console.log('\nDone! The notification system should now be active.');
    console.log('\nIf you encounter any errors, please apply the migrations manually through the Supabase dashboard SQL editor.');
    
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// Run migrations
applyMigrations(); 