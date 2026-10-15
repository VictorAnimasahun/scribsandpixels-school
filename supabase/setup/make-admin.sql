-- Make an account an admin (run in Supabase → SQL Editor, which runs as the database owner).
-- The person must have signed in once first, so their profile exists.
-- Replace the email and run it. The results must show one row (the email and 'admin');
-- "No rows returned" means no account has that email yet: sign in once first.
update public.profiles set role = 'admin' where email = 'animasahunvictor1@gmail.com' returning email, role;

-- To check who the admins are:
-- select email, role from public.profiles where role = 'admin';
-- To take admin away again:
-- update public.profiles set role = 'student' where email = '…';
