# InternMatch

![InternMatch](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?logo=tailwind-css)

InternMatch is a modern platform connecting talented students with quality internship opportunities. The application helps streamline the internship search and application process for students while providing companies an efficient way to find qualified interns.

🌐 [Live Demo: internmatch.pranavk.tech](https://internmatch.pranavk.tech)

![InternMatch Preview](public/internmatch-preview.png)

## Features

### For Students
- 🔍 **Advanced internship search** with filters for industry, location, and duration
- 📑 **Application tracking** to monitor application status
- 🔖 **Bookmarking system** to save interesting opportunities
- 📝 **Profile management** to showcase skills and experience

### For Companies
- 📢 **Internship posting** with detailed descriptions and requirements
- 👥 **Applicant management** to review and process applications
- 📊 **Analytics dashboard** for insights on posting performance
- 🏢 **Company profile** to showcase work culture and benefits

### For Administrators
- 👮‍♂️ **User management** for both students and companies
- 🛡️ **Content moderation** for internship postings
- 📈 **Platform analytics** to monitor usage and trends
- ⚙️ **System configuration** for platform settings

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/internmatch.git
   cd internmatch
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in the necessary environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_KEY`: Your Supabase public API key

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

## Project Structure

```
internmatch/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── layout/      # Layout components
│   │   ├── shared/      # Shared components
│   │   └── ui/          # Basic UI components
│   ├── context/         # React context providers
│   ├── db/              # Database connections & models
│   ├── lib/             # Utility libraries
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── company/     # Company pages
│   │   ├── profile/     # Profile pages
│   │   └── student/     # Student pages
│   ├── store/           # Zustand stores
│   ├── styles/          # Global styles & theme
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Root component
│   ├── index.css        # Global CSS
│   └── main.tsx         # Entry point
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Deployment

### Building for Production

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the compiled assets.

### Deploying to Production

The application is configured to be deployed to any static hosting platform. For the demo site, we're using:

- Domain: internmatch.pranavk.tech
- Hosting: Netlify/Vercel

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Pranav Khandelwal** - [pranavk.tech](https://pranavk.tech)
- **Email**: contact@pranavk.tech
- **GitHub**: [@beingzpranav](https://github.com/beingzpranav)
- **LinkedIn**: [beingzpranav](https://linkedin.com/in/beingzpranav)
- **Twitter**: [@beingzpranav_](https://x.com/beingzpranav_)

## Acknowledgments

- UI design inspiration from Figma Community templates
- Icons provided by [Lucide Icons](https://lucide.dev/)
- All the contributors who invested their time and expertise 