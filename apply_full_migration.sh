#!/bin/bash

echo "Running full database migration..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js and try again."
    exit 1
fi

# Check if .env file exists and has required variables
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found."
    echo "Creating sample .env file..."
    echo "SUPABASE_URL=your_supabase_url" > .env
    echo "SUPABASE_SERVICE_KEY=your_service_key" >> .env
    echo "Please update .env with your Supabase URL and service key."
    exit 1
fi

# Install required packages if needed
echo "Checking for required packages..."
if ! npm list @supabase/supabase-js dotenv --depth=0 &> /dev/null; then
    echo "Installing required packages..."
    npm install @supabase/supabase-js dotenv
fi

# Run the migration script
echo "Running migration script..."
node apply_full_migration.js

# Check if the script ran successfully
if [ $? -ne 0 ]; then
    echo "Migration failed."
    exit 1
else
    echo "Migration completed successfully."
fi 