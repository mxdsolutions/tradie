-- SQL to create missing tradie profile for admin@calibremedia.com.au

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 1. Find the user ID from auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@calibremedia.com.au';

    IF v_user_id IS NOT NULL THEN
        -- 2. Create the tradie profile if it doesn't exist
        INSERT INTO public.tradie_profiles (user_id, trade, is_available, is_approved)
        VALUES (v_user_id, 'General Tradie', TRUE, TRUE)
        ON CONFLICT (user_id) DO UPDATE 
        SET is_approved = TRUE;

        -- 3. Create a placeholder license if it doesn't exist
        INSERT INTO public.tradie_licenses (user_id, license_number)
        VALUES (v_user_id, 'PENDING-AUTH')
        ON CONFLICT DO NOTHING;

        -- 4. Ensure the role is set correctly in public.users
        UPDATE public.users 
        SET role = 'tradie' 
        WHERE id = v_user_id;

        RAISE NOTICE 'Tradie profile created/updated for user: %', v_user_id;
    ELSE
        RAISE NOTICE 'User not found with email: admin@calibremedia.com.au';
    END IF;
END $$;
