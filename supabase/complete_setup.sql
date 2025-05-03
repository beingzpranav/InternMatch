-- =====================================================
-- InternMatch Complete Database Setup
-- Author: Pranav Khandelwal
-- Website: https://pranavk.tech
-- =====================================================

-- ================= INITIAL SETUP =================

-- Drop all existing objects if they exist (for fresh setup)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret-here';

-- ================= EXTENSIONS =================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- For text search
CREATE EXTENSION IF NOT EXISTS "pgjwt";          -- For JWT
CREATE EXTENSION IF NOT EXISTS "citext";         -- For case-insensitive text

-- ================= CUSTOM TYPES =================

CREATE TYPE user_role AS ENUM ('student', 'company', 'admin');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'interview', 'rejected', 'accepted');
CREATE TYPE internship_type AS ENUM ('remote', 'onsite', 'hybrid');
CREATE TYPE education_level AS ENUM ('high_school', 'associate', 'bachelor', 'master', 'phd');
CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- ================= CORE TABLES =================

-- Users Table (extends Supabase auth.users)
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

-- Student Profiles
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    education_level education_level,
    university TEXT,
    major TEXT,
    graduation_year INT,
    resume_url TEXT,
    skills TEXT[],
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Profiles
CREATE TABLE company_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    website TEXT,
    logo_url TEXT,
    employee_count INT,
    location TEXT,
    founded_year INT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================= INTERNSHIP TABLES =================

-- Internships
CREATE TABLE internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    qualifications TEXT,
    type internship_type NOT NULL,
    location TEXT,
    duration INT, -- in weeks
    start_date DATE,
    application_deadline DATE,
    compensation TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    experience_level experience_level NOT NULL DEFAULT 'beginner',
    skills_required TEXT[],
    active BOOLEAN DEFAULT TRUE,
    views INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    status application_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(internship_id, student_id) -- Prevent duplicate applications
);

-- Bookmarks
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, internship_id) -- Prevent duplicate bookmarks
);

-- ================= COMMUNICATION TABLES =================

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================= SUPPLEMENTARY TABLES =================

-- Reviews (students can review companies after internships)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(application_id) -- One review per application
);

-- Skills taxonomy (predefined skills)
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Industries taxonomy
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================= VIEWS =================

-- View for Search
CREATE VIEW internship_search AS
SELECT 
    i.id,
    i.title,
    i.description,
    i.requirements,
    i.location,
    i.type,
    i.is_paid,
    i.experience_level,
    i.skills_required,
    i.application_deadline,
    i.active,
    cp.company_name,
    cp.industry,
    cp.logo_url,
    cp.verified
FROM 
    internships i
JOIN 
    company_profiles cp ON i.company_id = cp.id
WHERE 
    i.active = TRUE;

-- ================= FUNCTIONS =================

-- Function to search internships with filters
CREATE OR REPLACE FUNCTION search_internships(
    search_term TEXT DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    type_filter internship_type DEFAULT NULL,
    paid_only BOOLEAN DEFAULT NULL,
    experience_level_filter experience_level DEFAULT NULL,
    skills_filter TEXT[] DEFAULT NULL,
    industry_filter TEXT DEFAULT NULL,
    limit_val INTEGER DEFAULT 20,
    offset_val INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    location TEXT,
    type internship_type,
    is_paid BOOLEAN,
    experience_level experience_level,
    company_name TEXT,
    industry TEXT,
    logo_url TEXT,
    application_deadline DATE,
    skills_required TEXT[],
    verified BOOLEAN,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.title,
        i.description,
        i.location,
        i.type,
        i.is_paid,
        i.experience_level,
        i.company_name,
        i.industry,
        i.logo_url,
        i.application_deadline,
        i.skills_required,
        i.verified,
        CASE
            WHEN search_term IS NULL THEN 0
            ELSE (
                similarity(i.title, search_term) * 0.5 +
                similarity(i.description, search_term) * 0.3 +
                similarity(i.company_name, search_term) * 0.2
            )
        END AS similarity
    FROM
        internship_search i
    WHERE
        (search_term IS NULL OR 
         i.title ILIKE '%' || search_term || '%' OR
         i.description ILIKE '%' || search_term || '%' OR
         i.company_name ILIKE '%' || search_term || '%') AND
        (location_filter IS NULL OR i.location ILIKE '%' || location_filter || '%') AND
        (type_filter IS NULL OR i.type = type_filter) AND
        (paid_only IS NULL OR NOT paid_only OR i.is_paid = TRUE) AND
        (experience_level_filter IS NULL OR i.experience_level = experience_level_filter) AND
        (skills_filter IS NULL OR i.skills_required && skills_filter) AND
        (industry_filter IS NULL OR i.industry = industry_filter) AND
        i.active = TRUE AND
        (i.application_deadline IS NULL OR i.application_deadline >= CURRENT_DATE)
    ORDER BY
        CASE WHEN search_term IS NULL THEN i.application_deadline END ASC NULLS LAST,
        CASE WHEN search_term IS NOT NULL THEN similarity END DESC,
        i.verified DESC,
        i.application_deadline ASC
    LIMIT limit_val
    OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- Function to get application statistics for companies
CREATE OR REPLACE FUNCTION get_company_stats(company_id_param UUID)
RETURNS TABLE (
    total_internships BIGINT,
    active_internships BIGINT,
    total_applications BIGINT,
    pending_applications BIGINT,
    accepted_applications BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT i.id) AS total_internships,
        COUNT(DISTINCT CASE WHEN i.active = TRUE THEN i.id END) AS active_internships,
        COUNT(DISTINCT a.id) AS total_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) AS pending_applications,
        COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) AS accepted_applications
    FROM
        internships i
    LEFT JOIN
        applications a ON i.id = a.internship_id
    WHERE
        i.company_id = company_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to handle application status changes with notifications
CREATE OR REPLACE FUNCTION update_application_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for status change
    IF OLD.status <> NEW.status THEN
        -- Notify student
        INSERT INTO notifications (user_id, title, message, link)
        SELECT 
            sp.id,
            'Application Status Updated',
            'Your application for "' || i.title || '" has been updated to ' || NEW.status,
            '/applications/' || NEW.id
        FROM 
            student_profiles sp
        JOIN 
            internships i ON NEW.internship_id = i.id
        WHERE 
            sp.id = NEW.student_id;
            
        -- Create/update conversation if status is changed to interview
        IF NEW.status = 'interview' THEN
            -- Check if a conversation already exists
            IF NOT EXISTS (SELECT 1 FROM conversations WHERE application_id = NEW.id) THEN
                -- Create new conversation
                WITH new_conversation AS (
                    INSERT INTO conversations (application_id)
                    VALUES (NEW.id)
                    RETURNING id
                )
                -- Add initial message from company
                INSERT INTO messages (conversation_id, sender_id, content)
                SELECT 
                    nc.id,
                    i.company_id,
                    'Congratulations! We would like to schedule an interview for the ' || i.title || ' position. Please let us know your availability.'
                FROM 
                    new_conversation nc
                JOIN 
                    internships i ON NEW.internship_id = i.id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count for internships
CREATE OR REPLACE FUNCTION increment_internship_views(internship_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE internships
    SET views = views + 1
    WHERE id = internship_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to update "updated_at" timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================= TRIGGERS =================

-- Trigger for application status changes
CREATE TRIGGER application_status_change
AFTER UPDATE OF status ON applications
FOR EACH ROW
EXECUTE FUNCTION update_application_status();

-- Triggers to update timestamps
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_student_profiles_timestamp
BEFORE UPDATE ON student_profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_company_profiles_timestamp
BEFORE UPDATE ON company_profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_internships_timestamp
BEFORE UPDATE ON internships
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_applications_timestamp
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_reviews_timestamp
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ================= ROW LEVEL SECURITY =================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

-- ------------------- User Policies -------------------

-- RLS Policies for users table
CREATE POLICY users_read_own ON users
FOR SELECT
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY users_update_own ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ------------------- Profile Policies -------------------

-- RLS Policies for student_profiles
CREATE POLICY student_profiles_select_public ON student_profiles
FOR SELECT
USING (TRUE);

CREATE POLICY student_profiles_update_own ON student_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- RLS Policies for company_profiles
CREATE POLICY company_profiles_select_public ON company_profiles
FOR SELECT
USING (TRUE);

CREATE POLICY company_profiles_update_own ON company_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ------------------- Internship Policies -------------------

-- RLS Policies for internships
CREATE POLICY internships_select_public ON internships
FOR SELECT
USING (active = TRUE OR 
       company_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY internships_insert_company ON internships
FOR INSERT
WITH CHECK (company_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY internships_update_company ON internships
FOR UPDATE
USING (company_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (company_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY internships_delete_company ON internships
FOR DELETE
USING (company_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ------------------- Application Policies -------------------

-- RLS Policies for applications
CREATE POLICY applications_select_own ON applications
FOR SELECT
USING (student_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM internships WHERE id = internship_id AND company_id = auth.uid()) OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY applications_insert_student ON applications
FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY applications_update_company ON applications
FOR UPDATE
USING (EXISTS (SELECT 1 FROM internships WHERE id = internship_id AND company_id = auth.uid()) OR
       student_id = auth.uid() OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM internships WHERE id = internship_id AND company_id = auth.uid()) OR
            student_id = auth.uid() OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ------------------- Bookmark Policies -------------------

-- RLS Policies for bookmarks
CREATE POLICY bookmarks_select_own ON bookmarks
FOR SELECT
USING (student_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY bookmarks_insert_own ON bookmarks
FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY bookmarks_delete_own ON bookmarks
FOR DELETE
USING (student_id = auth.uid());

-- ------------------- Communication Policies -------------------

-- RLS Policies for conversations and messages
CREATE POLICY conversations_select_participant ON conversations
FOR SELECT
USING (EXISTS (SELECT 1 FROM applications a 
               JOIN internships i ON a.internship_id = i.id 
               WHERE a.id = application_id AND 
                     (a.student_id = auth.uid() OR i.company_id = auth.uid())) OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY messages_select_participant ON messages
FOR SELECT
USING (EXISTS (SELECT 1 FROM conversations c 
               JOIN applications a ON c.application_id = a.id
               JOIN internships i ON a.internship_id = i.id
               WHERE c.id = conversation_id AND
                     (a.student_id = auth.uid() OR i.company_id = auth.uid())) OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY messages_insert_participant ON messages
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM conversations c 
                    JOIN applications a ON c.application_id = a.id
                    JOIN internships i ON a.internship_id = i.id
                    WHERE c.id = conversation_id AND
                          (a.student_id = auth.uid() OR i.company_id = auth.uid())) AND
            sender_id = auth.uid());

-- ------------------- Notification Policies -------------------

-- RLS Policies for notifications
CREATE POLICY notifications_select_own ON notifications
FOR SELECT
USING (user_id = auth.uid());

-- ------------------- Review Policies -------------------

-- RLS Policies for reviews
CREATE POLICY reviews_select_public ON reviews
FOR SELECT
USING (NOT is_anonymous OR student_id = auth.uid() OR 
       EXISTS (SELECT 1 FROM applications a
               JOIN internships i ON a.internship_id = i.id
               WHERE a.id = application_id AND i.company_id = auth.uid()) OR
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY reviews_insert_student ON reviews
FOR INSERT
WITH CHECK (student_id = auth.uid() AND 
            EXISTS (SELECT 1 FROM applications 
                   WHERE id = application_id AND 
                         student_id = auth.uid() AND
                         status = 'accepted'));

CREATE POLICY reviews_update_own ON reviews
FOR UPDATE
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY reviews_delete_own ON reviews
FOR DELETE
USING (student_id = auth.uid());

-- ------------------- Reference Data Policies -------------------

-- RLS Policies for skills and industries (read-only for most users)
CREATE POLICY skills_select_all ON skills
FOR SELECT
USING (TRUE);

CREATE POLICY industries_select_all ON industries
FOR SELECT
USING (TRUE);

CREATE POLICY skills_admin ON skills
FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY industries_admin ON industries
FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ================= INITIAL DATA POPULATION =================

-- Populate basic skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('Python', 'Programming'),
('Java', 'Programming'),
('C++', 'Programming'),
('SQL', 'Database'),
('React', 'Frontend'),
('Angular', 'Frontend'),
('Vue.js', 'Frontend'),
('Node.js', 'Backend'),
('Django', 'Backend'),
('Spring Boot', 'Backend'),
('Express.js', 'Backend'),
('MongoDB', 'Database'),
('PostgreSQL', 'Database'),
('MySQL', 'Database'),
('AWS', 'Cloud'),
('Azure', 'Cloud'),
('Google Cloud', 'Cloud'),
('Docker', 'DevOps'),
('Kubernetes', 'DevOps'),
('Git', 'Tools'),
('RESTful API', 'Web Development'),
('GraphQL', 'Web Development'),
('UI/UX Design', 'Design'),
('Adobe Photoshop', 'Design'),
('Figma', 'Design'),
('Machine Learning', 'Data Science'),
('Deep Learning', 'Data Science'),
('Natural Language Processing', 'Data Science'),
('Data Analysis', 'Data Science'),
('Product Management', 'Business'),
('Agile/Scrum', 'Methodologies'),
('Technical Writing', 'Communication'),
('SEO', 'Marketing'),
('Digital Marketing', 'Marketing');

-- Populate industries
INSERT INTO industries (name, description) VALUES
('Technology', 'Software, hardware, IT services and telecommunications'),
('Finance', 'Banking, investment management, insurance and fintech'),
('Healthcare', 'Medical services, pharmaceuticals, and health technology'),
('Education', 'Educational institutions, edtech, and training services'),
('Retail', 'Physical and online retail of consumer goods'),
('Manufacturing', 'Production of physical goods and products'),
('Media & Entertainment', 'Publishing, broadcasting, film, music, and digital media'),
('Marketing & Advertising', 'Marketing agencies, advertising, and market research'),
('Consulting', 'Business, management, and technical consulting services'),
('Non-profit', 'Charitable organizations and foundations'),
('Government', 'Public sector and government agencies'),
('Energy', 'Oil, gas, renewable energy, and utilities'),
('Real Estate', 'Property development, management, and sales'),
('Transportation & Logistics', 'Moving people and goods, supply chain management'),
('Hospitality & Tourism', 'Hotels, restaurants, events, and travel services'),
('Agriculture', 'Farming, forestry, and food production'),
('Construction', 'Building and infrastructure development'),
('Legal Services', 'Law firms and legal consultancies'),
('Environmental Services', 'Sustainability, conservation, and green technologies'),
('Aerospace & Defense', 'Aircraft, space, and defense technologies');

-- ================= ADMINISTRATOR SETUP =================

-- Uncomment and modify the following line to create an admin user after registration
-- UPDATE users SET role = 'admin' WHERE id = 'your-user-id-from-auth';

-- =====================================================
-- END OF SCRIPT
-- ===================================================== 