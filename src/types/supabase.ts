export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'student' | 'company' | 'admin'
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          company_name: string | null
          company_size: string | null
          company_industry: string | null
          university: string | null
          degree: string | null
          graduation_year: number | null
          resume_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'student' | 'company' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          company_name?: string | null
          company_size?: string | null
          company_industry?: string | null
          university?: string | null
          degree?: string | null
          graduation_year?: number | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'student' | 'company' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          company_name?: string | null
          company_size?: string | null
          company_industry?: string | null
          university?: string | null
          degree?: string | null
          graduation_year?: number | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      internships: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          requirements: string
          location: string
          is_remote: boolean
          type: 'full-time' | 'part-time'
          duration: string
          stipend: string | null
          deadline: string | null
          skills: string[]
          status: 'open' | 'closed' | 'draft'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          requirements: string
          location: string
          is_remote?: boolean
          type: 'full-time' | 'part-time'
          duration: string
          stipend?: string | null
          deadline?: string | null
          skills: string[]
          status?: 'open' | 'closed' | 'draft'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string
          requirements?: string
          location?: string
          is_remote?: boolean
          type?: 'full-time' | 'part-time'
          duration?: string
          stipend?: string | null
          deadline?: string | null
          skills?: string[]
          status?: 'open' | 'closed' | 'draft'
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          internship_id: string
          student_id: string
          cover_letter: string | null
          resume_url: string | null
          status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          internship_id: string
          student_id: string
          cover_letter?: string | null
          resume_url?: string | null
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          internship_id?: string
          student_id?: string
          cover_letter?: string | null
          resume_url?: string | null
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          student_id: string
          internship_id: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          internship_id: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          internship_id?: string
          created_at?: string
        }
      }
    }
  }
}