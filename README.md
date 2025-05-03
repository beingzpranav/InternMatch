# InternMatch

InternMatch is a comprehensive platform connecting students with companies for internship opportunities. The application streamlines the internship search, application, and management process for both students and companies.

## Features

### For Students

- **Internship Discovery**: Browse and search for internships based on location, industry, and required skills
- **Application Management**: Track status of applications and receive updates
- **Profile Management**: Create and maintain professional profiles with education and skills
- **Resume Management**: Upload, store and share resumes with potential employers
- **Bookmarking**: Save favorite internship listings for later viewing
- **Messaging**: Communicate directly with companies
- **Interview Scheduling**: View and manage upcoming interviews
- **Notifications**: Receive alerts about application status changes and messages

### For Companies

- **Internship Creation**: Post detailed internship listings with requirements and deadlines
- **Applicant Management**: Review, filter, and respond to student applications
- **Candidate Evaluation**: Compare and assess applicant qualifications
- **Interview Scheduling**: Arrange and manage interviews with candidates
- **Messaging**: Communicate directly with applicants
- **Company Profile**: Showcase company information, culture, and opportunities
- **Notifications**: Receive alerts about new applications and messages

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Supabase (PostgreSQL database with built-in authentication and APIs)
- **Styling**: Tailwind CSS
- **Storage**: Supabase Storage for file uploads
- **Authentication**: Supabase Auth with email/password and social login options

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/internmatch.git
   cd internmatch
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

4. Set up the database:
   ```
   # For Windows
   ./apply_full_migration.bat
   
   # For Unix/macOS
   chmod +x ./apply_full_migration.sh
   ./apply_full_migration.sh
   
   # Directly with Node.js
   node apply_full_migration.js
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Database Structure

InternMatch uses a PostgreSQL database managed through Supabase with the following key tables:

- **profiles**: User profiles (students, companies, admins)
- **internships**: Internship listings created by companies
- **applications**: Student applications for internships
- **bookmarks**: Student bookmarks for internships
- **messages**: Direct messages between users
- **notifications**: System notifications for users
- **interviews**: Interview scheduling information
- **resume_sections**: Resume builder components for students

See `DATABASE_SETUP.md` for detailed information about the database schema and migration process.

## Project Structure

```
internmatch/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Admin-specific components
│   │   ├── auth/        # Authentication components
│   │   ├── company/     # Company-specific components
│   │   ├── layout/      # Layout components (header, footer, etc.)
│   │   ├── student/     # Student-specific components
│   │   └── ui/          # Base UI components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── company/     # Company pages
│   │   └── student/     # Student pages
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── supabase/
│   └── migrations/      # Database migration files
├── .env                 # Environment variables (not in repository)
├── apply_full_migration.js    # Migration script
├── apply_full_migration.bat   # Windows migration script wrapper
├── apply_full_migration.sh    # Unix migration script wrapper
├── DATABASE_SETUP.md    # Database setup documentation
├── CLEANUP.md           # Project cleanup documentation
└── README.md            # This file
```

## UI Features

### Mobile Responsiveness
InternMatch is fully responsive and optimized for mobile devices with:

- **Bottom Navigation Bar**: Easy access to key sections on mobile devices
- **Touch-Optimized UI**: Larger touch targets for better mobile interaction
- **Slide-Out Navigation Menu**: Access to all application features
- **Responsive Layouts**: Adapts to various screen sizes from phones to desktops
- **Optimized Forms**: Mobile-friendly form inputs and controls

### Time Display Feature

InternMatch includes comprehensive time display with all dates, showing both date and time information using the `toLocaleString()` method. This provides users with more detailed timestamps for:

- Application submissions
- Internship posting and deadlines
- Interview scheduling
- Messages and notifications
- Profile updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped with the development of InternMatch
- Special thanks to the Supabase team for their excellent platform and documentation 