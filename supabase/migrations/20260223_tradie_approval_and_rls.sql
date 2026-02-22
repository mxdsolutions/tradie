-- Add is_approved column to tradie_profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tradie_profiles' AND column_name = 'is_approved') THEN
        ALTER TABLE public.tradie_profiles ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Enable RLS on tables if not already enabled
ALTER TABLE public.tradie_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tradie_licenses ENABLE ROW LEVEL SECURITY;

-- Policies for tradie_profiles
DROP POLICY IF EXISTS "Users can insert their own tradie profile" ON public.tradie_profiles;
CREATE POLICY "Users can insert their own tradie profile" 
ON public.tradie_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tradie profile" ON public.tradie_profiles;
CREATE POLICY "Users can update their own tradie profile" 
ON public.tradie_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own tradie profile" ON public.tradie_profiles;
CREATE POLICY "Users can view their own tradie profile" 
ON public.tradie_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view approved tradie profiles" ON public.tradie_profiles;
CREATE POLICY "Anyone can view approved tradie profiles" 
ON public.tradie_profiles FOR SELECT 
TO authenticated 
USING (is_approved = TRUE);

-- Policies for tradie_licenses
DROP POLICY IF EXISTS "Users can insert their own license" ON public.tradie_licenses;
CREATE POLICY "Users can insert their own license" 
ON public.tradie_licenses FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own license" ON public.tradie_licenses;
CREATE POLICY "Users can view their own license" 
ON public.tradie_licenses FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Ensure users can update their own user record (if the trigger hasn't already handled everything)
-- Assuming the table is 'users' and has an 'id' column matching auth.uid()
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);
