-- Make an account an admin (run in Supabase → SQL Editor, which runs as the database owner).
-- The person must have signed in once first, so their profile exists.
-- Replace the email, run it, and check that it says "UPDATE 1".
update public.profiles set role = 'admin' where email = 'animasahunvictor1@gmail.com';

-- To check who the admins are:
-- select email, role from public.profiles where role = 'admin';
-- To take admin away again:
-- update public.profiles set role = 'student' where email = '…';
