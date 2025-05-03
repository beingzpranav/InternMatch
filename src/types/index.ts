export type UserRole = 'student' | 'company' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
}

export interface StudentProfile extends User {
  bio: string | null;
  location: string | null;
  university: string | null;
  degree: string | null;
  graduation_year: number | null;
  resume_url: string | null;
}

export interface CompanyProfile extends User {
  company_name: string | null;
  company_size: string | null;
  company_industry: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
}

export interface AdminProfile extends User {
  // Admin-specific fields if needed
}

export interface Internship {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  is_remote: boolean;
  type: 'full-time' | 'part-time';
  duration: string;
  stipend: string | null;
  deadline: string | null;
  skills: string[];
  status: 'open' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
  company?: CompanyProfile;
}

export interface Application {
  id: string;
  internship_id: string;
  student_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  internship?: Internship;
  student?: StudentProfile;
}

export interface Bookmark {
  id: string;
  student_id: string;
  internship_id: string;
  created_at: string;
  internship?: Internship;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  related_to: 'application' | 'internship' | 'general';
  related_id?: string;
  subject?: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    full_name: string;
    email: string;
    role: string;
  };
  recipient?: {
    full_name: string;
    email: string;
    role: string;
  };
}