# Database Setup for InternMatch

This document explains how to set up and migrate the database for the InternMatch application.

## Migration System

The InternMatch application uses a Supabase backend, and we've simplified the migration process by consolidating all database schema changes into a single file.

### Migration Files

- `supabase/migrations/full_migration.sql` - A comprehensive SQL script that contains all the necessary database setup including tables, indexes, functions, triggers, and policies.

### Running the Migration

We provide multiple ways to apply the migrations:

#### Using the Script Files

1. **For Windows users:**
   ```
   ./apply_full_migration.bat
   ```

2. **For Unix/macOS users:**
   ```
   chmod +x ./apply_full_migration.sh
   ./apply_full_migration.sh
   ```

3. **Directly with Node.js:**
   ```
   node apply_full_migration.js
   ```

#### Setting Up Environment Variables

Before running the migration scripts, make sure you have the following environment variables set:

- `SUPABASE_URL`: Your Supabase project URL (e.g. https://abcdefghijklm.supabase.co)
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key (found in your project settings)

You can set these in a `.env` file in the root directory of the project.

## Database Schema

### Core Tables

1. **profiles** - User profiles (students, companies, admins)
2. **internships** - Internship listings created by companies
3. **applications** - Student applications for internships
4. **bookmarks** - Student bookmarks for internships
5. **messages** - Direct messages between users
6. **notifications** - System notifications for users
7. **interviews** - Interview scheduling information
8. **resume_sections** - Resume builder components for students

### Row Level Security (RLS) Policies

The database uses Supabase's Row Level Security to ensure that users can only access data they're authorized to see. For example:

- Students can only view and manage their own applications and bookmarks
- Companies can only view applications to their own internships
- Companies can only create and manage their own internships

## Manual Interaction with the Database

If you need to interact directly with the database:

1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor" section
3. Run SQL queries directly against your database

## Troubleshooting

If you encounter issues with the migration:

1. Check that your environment variables are set correctly
2. Ensure you have sufficient permissions in your Supabase project
3. Look for specific error messages in the console output
4. For persistent issues, you may need to drop and recreate tables manually

## Backup and Restore

Before running migrations in a production environment, always create a backup:

1. In the Supabase dashboard, go to Project Settings > Database
2. Under "Database", find the "Backups" section
3. Create a manual backup

To restore from a backup:
1. Contact Supabase support with your backup ID

## Development vs. Production

For local development, you may want to use a separate Supabase project to avoid affecting production data. You can switch between environments by changing the environment variables. 