@echo off
echo Running full database migration...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js and try again.
    exit /b 1
)

REM Check if .env file exists and has required variables
if not exist .env (
    echo Warning: .env file not found.
    echo Creating sample .env file...
    echo SUPABASE_URL=your_supabase_url > .env
    echo SUPABASE_SERVICE_KEY=your_service_key >> .env
    echo Please update .env with your Supabase URL and service key.
    exit /b 1
)

REM Install required packages if needed
echo Checking for required packages...
npm list @supabase/supabase-js dotenv --depth=0 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing required packages...
    npm install @supabase/supabase-js dotenv
)

REM Run the migration script
echo Running migration script...
node apply_full_migration.js

REM Check if the script ran successfully
if %ERRORLEVEL% neq 0 (
    echo Migration failed.
    exit /b 1
) else (
    echo Migration completed successfully.
) 