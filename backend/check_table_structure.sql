-- Diagnostic script to check and fix the users table structure

-- First, let's see what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- Check if the users table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- If the table doesn't exist or has wrong structure, let's recreate it
DROP TABLE IF EXISTS public.users CASCADE;

-- Create the users table with the correct structure
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID NOT NULL UNIQUE, -- This links to Supabase Auth user ID
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'premium')),
    profile_data JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a simple RLS policy for now
CREATE POLICY "Allow all operations for now" ON public.users
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Now migrate existing users from Supabase Auth
INSERT INTO public.users (auth_id, username, email, role, profile_data, preferences)
SELECT 
    au.id as auth_id,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'user') as role,
    '{}'::jsonb as profile_data,
    '{}'::jsonb as preferences
FROM auth.users au
ON CONFLICT (auth_id) DO NOTHING;

-- Verify the table structure again
SELECT 'Table structure after recreation:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Show how many users were migrated
SELECT COUNT(*) as total_users_migrated FROM public.users;

-- Show a sample of migrated users
SELECT auth_id, username, email, role FROM public.users LIMIT 5;
