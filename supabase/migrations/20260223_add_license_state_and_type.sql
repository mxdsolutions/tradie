-- Add state and license_type columns to tradie_licenses if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tradie_licenses' AND column_name = 'state') THEN
        ALTER TABLE public.tradie_licenses ADD COLUMN state VARCHAR(3);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tradie_licenses' AND column_name = 'license_type') THEN
        ALTER TABLE public.tradie_licenses ADD COLUMN license_type VARCHAR;
    END IF;
END $$;
