-- Audit fix (16 Oct 2026): a learner could DELETE their own profile through the API (the
-- "own profile" policy covers every action, and delete was never revoked). That cascades away
-- all their progress and leaves an account with no profile, which the app can't load.
-- Profiles are created by the signup trigger and removed only with the account itself
-- (auth.users → profiles cascade, run by the owner), so learners don't need delete at all.
revoke delete on public.profiles from anon, authenticated;
