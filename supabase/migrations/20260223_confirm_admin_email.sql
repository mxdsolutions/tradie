-- SQL to manually confirm the email for admin@calibremedia.com.au

UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'admin@calibremedia.com.au';

RAISE NOTICE 'Email confirmed for admin@calibremedia.com.au';
