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
   - Stores user information including basic details and role-specific data
   - Contains separate fields for student and company profiles

2. **internships** - Internship listings created by companies
   - Contains details about internship opportunities
   - Includes location, requirements, deadlines, and other metadata

3. **applications** - Student applications for internships
   - Connects students to internships they've applied for
   - Tracks application status (pending, reviewing, accepted, rejected)

4. **bookmarks** - Student bookmarks for internships
   - Allows students to save internships they're interested in

5. **messages** - Direct messages between users
   - Facilitates communication between students and companies

6. **notifications** - System notifications for users
   - Keeps users informed about important events

7. **interviews** - Interview scheduling information
   - Stores details about interviews for applications
   - Includes scheduling information and status

8. **resume_sections** - Resume builder components for students
   - Stores sections of student resumes for the resume builder feature

### Row Level Security (RLS) Policies

The database uses Supabase's Row Level Security to ensure that users can only access data they're authorized to see. For example:

- Students can only view and manage their own applications and bookmarks
- Companies can only view applications to their own internships
- Companies can only create and manage their own internships

### Database Indexes

Various indexes have been created on frequently queried columns to improve performance:

- Indexes on foreign keys (e.g., student_id, internship_id)
- Indexes for commonly filtered fields

## Supabase Setup

### Creating a New Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Create a new project and note your project URL and keys
3. Add these keys to your `.env` file

### Storage Buckets

The application uses Supabase Storage for file storage:

- **resumes** bucket - For storing student resume files
- **avatars** bucket - For storing user profile pictures

## Functions and Triggers

The database includes several PostgreSQL functions and triggers:

1. **update_profile_info()** - Updates profile information when users modify their details
   - Called by a trigger on auth.users updates

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

## Development vs. Production

For local development, you may want to use a separate Supabase project to avoid affecting production data. You can switch between environments by changing the environment variables in your `.env` file. 