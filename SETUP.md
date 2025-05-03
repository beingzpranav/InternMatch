# InternMatch Project Setup Guide

This guide will help you set up the InternMatch project on your local machine. Follow these steps to get the application running with the database properly configured.

## Prerequisites

Before you begin, make sure you have the following installed:
- Node.js (v18+)
- npm or yarn
- PostgreSQL or a Supabase account
- Git

## Step 1: Clone the Repository

```bash
git clone https://github.com/beingzpranav/internmatch.git
cd internmatch
```

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 3: Database Setup

### Option A: Using Supabase (Recommended)

1. Create a new project on [Supabase](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase/init.sql` from this repository
4. Paste and run the SQL script in Supabase SQL Editor
5. Get your Supabase URL and anon key from the API settings

### Option B: Using Local PostgreSQL

1. Install PostgreSQL if you haven't already
2. Create a new database called `internmatch`
3. Run the SQL script in `supabase/init.sql`:
   ```bash
   psql -d internmatch -f supabase/init.sql
   ```
4. Set up JWT authentication for your PostgreSQL database

## Step 4: Environment Configuration

1. Create a `.env` file in the project root by copying the example:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables with your database credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_KEY=your-supabase-anon-key
   VITE_APP_URL=http://localhost:5173
   VITE_API_URL=http://localhost:5173/api
   ```

## Step 5: Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:5173` in your browser to see the application running.

## Step 6: Setting Up Admin Access (Optional)

To create an admin user:

1. First, register a normal user account through the application
2. Get the user ID from the Supabase authentication dashboard
3. Connect to your database and run:
   ```sql
   UPDATE users SET role = 'admin' WHERE id = 'your-user-id';
   ```

## Database Schema Overview

The InternMatch platform uses a relational database with the following key tables:

- `users`: Core user information with role-based access
- `student_profiles`: Profile data for student users
- `company_profiles`: Profile data for company users
- `internships`: Internship listing details
- `applications`: Student applications for internships
- `bookmarks`: Saved internships for students
- `conversations` and `messages`: Messaging system
- `notifications`: System notifications
- `reviews`: Student reviews of companies after internships
- `skills` and `industries`: Reference data

The database includes:
- Row Level Security (RLS) for proper data access control
- Advanced search functionality
- Automated triggers for notifications
- Statistics functions for analytics

## Production Deployment

When deploying to production:

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Update your environment variables for the production environment
3. Deploy the `dist` directory to your hosting service

For hosting on internmatch.pranavk.tech, follow the deployment guide in your hosting service documentation.

## Troubleshooting

If you encounter issues:

1. **Database Connection Problems**:
   - Verify your Supabase URL and key are correct
   - Check that the database exists and the SQL script ran successfully

2. **Authentication Issues**:
   - Ensure your JWT secret is properly configured
   - Check user roles in the database

3. **Application Errors**:
   - Check the console for error messages
   - Verify all environment variables are set correctly

## Need Help?

Contact the original developer:
- Pranav Khandelwal - [pranavk.tech](https://pranavk.tech)
- GitHub: [@beingzpranav](https://github.com/beingzpranav)

Or submit an issue on the GitHub repository. 