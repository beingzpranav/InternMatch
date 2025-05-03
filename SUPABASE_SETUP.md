# Supabase Setup for InternMatch

This document provides detailed instructions for setting up the database tables and security policies in Supabase for the InternMatch project.

## Getting Started with Supabase

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)
2. Note your project URL and anon key (you'll need these for your environment variables)

## Database Setup

### Option 1: Using the SQL Editor (Recommended)

1. In your Supabase dashboard, navigate to the **SQL Editor** tab
2. Click **New Query**
3. Copy the entire content of the `supabase/init.sql` file from this repository
4. Paste it into the SQL Editor
5. Click **Run** to execute the script
6. Wait for completion (this might take a minute)

### Option 2: Individual Table Creation

If you prefer to create tables one by one or need to modify specific tables, follow the guide below.

## Table Structure Summary

| Table Name | Purpose | Key Relations |
|------------|---------|---------------|
| users | Core user information | Extends auth.users |
| student_profiles | Student data | Connected to users |
| company_profiles | Company data | Connected to users |
| internships | Internship listings | Created by companies |
| applications | Student applications | Links students to internships |
| bookmarks | Saved internships | Links students to internships |
| conversations | Message threads | Connected to applications |
| messages | Individual messages | Part of conversations |
| notifications | System notifications | Sent to users |
| reviews | Internship reviews | From students about companies |
| skills | Predefined skills list | Referenced by internships and profiles |
| industries | Industry categories | Referenced by companies and filters |

## Essential Policies

Supabase uses Row Level Security (RLS) policies to control data access. Here are the key policies implemented:

### Users Table Policies

```sql
-- Allow users to read their own data or admin to read any user
CREATE POLICY users_read_own ON users
FOR SELECT
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Allow users to update only their own data
CREATE POLICY users_update_own ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Student Profiles Policies

```sql
-- Allow anyone to read student profiles (public data)
CREATE POLICY student_profiles_select_public ON student_profiles
FOR SELECT
USING (TRUE);

-- Allow students to update only their own profile
CREATE POLICY student_profiles_update_own ON student_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Company Profiles Policies

```sql
-- Allow anyone to read company profiles (public data)
CREATE POLICY company_profiles_select_public ON company_profiles
FOR SELECT
USING (TRUE);

-- Allow companies to update only their own profile
CREATE POLICY company_profiles_update_own ON company_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Internships Policies

```sql
-- Allow public access to active internships, or company to view their own, or admin to view all
CREATE POLICY internships_select_public ON internships
FOR SELECT
USING (active = TRUE OR 
       company_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Allow companies to create their own internships
CREATE POLICY internships_insert_company ON internships
FOR INSERT
WITH CHECK (company_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Allow companies to update their own internships
CREATE POLICY internships_update_company ON internships
FOR UPDATE
USING (company_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (company_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Allow companies to delete their own internships
CREATE POLICY internships_delete_company ON internships
FOR DELETE
USING (company_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
```

### Applications Policies

```sql
-- Allow students to see their own applications and companies to see applications for their internships
CREATE POLICY applications_select_own ON applications
FOR SELECT
USING (student_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM internships WHERE id = internship_id AND company_id = auth.uid()) OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Allow students to create applications
CREATE POLICY applications_insert_student ON applications
FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Allow relevant parties to update applications
CREATE POLICY applications_update_company ON applications
FOR UPDATE
USING (EXISTS (SELECT 1 FROM internships WHERE id = internship_id AND company_id = auth.uid()) OR
       student_id = auth.uid() OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM internships WHERE id = internship_id AND company_id = auth.uid()) OR
            student_id = auth.uid() OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
```

## Verifying Your Setup

To verify your Supabase setup:

1. In the Supabase dashboard, go to **Table Editor**
2. You should see all the tables created by the SQL script
3. Check that the relationships are established by viewing a table and checking the Foreign Key constraints
4. Test the RLS policies by:
   - Going to the **Authentication** tab
   - Creating a user
   - Using the **SQL Editor** to run queries as that user

## Common Issues and Solutions

### Error: "permission denied for schema public"

Solution: Ensure you have the right privileges set:

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
```

### Error: "relation does not exist"

Solution: Check if all tables were created. If a table is missing, you may need to create it:

```sql
-- Example for users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Error: "type user_role does not exist"

Solution: Make sure you've created all custom types:

```sql
-- Recreate user_role type
CREATE TYPE user_role AS ENUM ('student', 'company', 'admin');
```

## Custom Functions and Triggers

The InternMatch database includes several functions and triggers:

1. **search_internships()** - For advanced internship searching
2. **get_company_stats()** - For company dashboard analytics
3. **update_application_status()** - For handling application updates
4. **increment_internship_views()** - For tracking internship views
5. **update_timestamp()** - For maintaining timestamps on records

You can verify these have been created by going to **Database** > **Functions** in the Supabase dashboard.

## Next Steps

After setting up Supabase:

1. Update your application's environment variables with your Supabase URL and key
2. Test your application's connection to Supabase
3. Create a few test users with different roles to verify security policies

For more information, refer to the [Supabase documentation](https://supabase.com/docs). 