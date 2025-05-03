-- Full Migration File for InternMatch Application
-- This file combines all the migrations into a single comprehensive setup script

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up storage for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create basic tables

-- Profiles table (users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'company', 'admin')),
    
    -- Student specific fields
    bio TEXT,
    location VARCHAR(255),
    university VARCHAR(255),
    degree VARCHAR(255),
    graduation_year INT,
    resume_url TEXT,
    skills JSONB,
    
    -- Company specific fields
    company_name VARCHAR(255),
    company_size VARCHAR(100),
    company_industry VARCHAR(255),
    website VARCHAR(255),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Internships table
CREATE TABLE IF NOT EXISTS public.internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_remote BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('full-time', 'part-time')),
    duration VARCHAR(100) NOT NULL,
    stipend VARCHAR(100),
    deadline TIMESTAMPTZ,
    skills TEXT[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL CHECK (status IN ('open', 'closed', 'draft')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
    cover_letter TEXT,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (internship_id, student_id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, internship_id)
);

-- Messages table for communication between users
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    related_to VARCHAR(50) NOT NULL CHECK (related_to IN ('application', 'internship', 'general')),
    related_id UUID,
    subject VARCHAR(255),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    meeting_type VARCHAR(50) NOT NULL CHECK (meeting_type IN ('video', 'phone', 'in-person')),
    meeting_link TEXT,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume builder components
CREATE TABLE IF NOT EXISTS public.resume_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content JSONB,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_internships_company_id ON public.internships(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON public.applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_student_id ON public.bookmarks(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_resume_sections_student_id ON public.resume_sections(student_id);

-- Function to update profile info
CREATE OR REPLACE FUNCTION public.update_profile_info()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET 
        updated_at = NOW(),
        avatar_url = COALESCE(NEW.avatar_url, profiles.avatar_url),
        full_name = COALESCE(NEW.full_name, profiles.full_name),
        
        -- Student fields
        bio = CASE WHEN profiles.role = 'student' THEN COALESCE(NEW.bio, profiles.bio) ELSE profiles.bio END,
        location = CASE WHEN profiles.role IN ('student', 'company') THEN COALESCE(NEW.location, profiles.location) ELSE profiles.location END,
        university = CASE WHEN profiles.role = 'student' THEN COALESCE(NEW.university, profiles.university) ELSE profiles.university END,
        degree = CASE WHEN profiles.role = 'student' THEN COALESCE(NEW.degree, profiles.degree) ELSE profiles.degree END,
        graduation_year = CASE WHEN profiles.role = 'student' THEN COALESCE(NEW.graduation_year, profiles.graduation_year) ELSE profiles.graduation_year END,
        resume_url = CASE WHEN profiles.role = 'student' THEN COALESCE(NEW.resume_url, profiles.resume_url) ELSE profiles.resume_url END,
        skills = CASE WHEN profiles.role = 'student' THEN COALESCE(NEW.skills, profiles.skills) ELSE profiles.skills END,
        
        -- Company fields
        company_name = CASE WHEN profiles.role = 'company' THEN COALESCE(NEW.company_name, profiles.company_name) ELSE profiles.company_name END,
        company_size = CASE WHEN profiles.role = 'company' THEN COALESCE(NEW.company_size, profiles.company_size) ELSE profiles.company_size END,
        company_industry = CASE WHEN profiles.role = 'company' THEN COALESCE(NEW.company_industry, profiles.company_industry) ELSE profiles.company_industry END,
        website = CASE WHEN profiles.role = 'company' THEN COALESCE(NEW.website, profiles.website) ELSE profiles.website END
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up RLS (Row Level Security) policies

-- Profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Internships table policies
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internships are viewable by everyone"
ON public.internships FOR SELECT
USING (true);

CREATE POLICY "Companies can insert their own internships"
ON public.internships FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can update their own internships"
ON public.internships FOR UPDATE
TO authenticated
USING (auth.uid() = company_id);

CREATE POLICY "Companies can delete their own internships"
ON public.internships FOR DELETE
TO authenticated
USING (auth.uid() = company_id);

-- Applications table policies
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own applications"
ON public.applications FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Companies can view applications for their internships"
ON public.applications FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT company_id 
        FROM public.internships 
        WHERE id = internship_id
    )
);

CREATE POLICY "Admins can view all applications"
ON public.applications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Students can insert their own applications"
ON public.applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Companies can update applications for their internships"
ON public.applications FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT company_id 
        FROM public.internships 
        WHERE id = internship_id
    )
);

-- Bookmarks table policies
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own bookmarks"
ON public.bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own bookmarks"
ON public.bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can delete their own bookmarks"
ON public.bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = student_id);

-- Messages table policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they've sent or received"
ON public.messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages they're sending"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update message read status"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

-- Interviews table policies
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view interviews they've scheduled"
ON public.interviews FOR SELECT
TO authenticated
USING (auth.uid() = company_id);

CREATE POLICY "Students can view their own interviews"
ON public.interviews FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all interviews"
ON public.interviews FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Companies can insert interviews"
ON public.interviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can update their own interviews"
ON public.interviews FOR UPDATE
TO authenticated
USING (auth.uid() = company_id);

-- Notifications table policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Recipients can update notification read status"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

-- Resume sections table policies
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own resume sections"
ON public.resume_sections FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own resume sections"
ON public.resume_sections FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own resume sections"
ON public.resume_sections FOR UPDATE
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own resume sections"
ON public.resume_sections FOR DELETE
TO authenticated
USING (auth.uid() = student_id);

-- Create triggers
CREATE TRIGGER on_profile_update
BEFORE UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_info();

-- Create sample admin user if needed (commented out for safety)
-- INSERT INTO auth.users (id, email, role) VALUES
-- ('00000000-0000-0000-0000-000000000000', 'admin@internmatch.com', 'admin');
-- 
-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin@internmatch.com', 'System Admin', 'admin'); 