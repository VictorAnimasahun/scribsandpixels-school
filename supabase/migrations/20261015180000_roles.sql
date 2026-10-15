-- Student and admin accounts (15 Oct 2026).
--
-- Every account is a student. An admin (the school's coach) can also *read* every learner's
-- progress: profiles, enrollments, ticks, finished days, study days, checkpoints and attempts.
-- Admins can't change anyone else's data, and can't read the private notes (daily logs, wins,
-- job applications) or emails sent.
--
-- Nobody can make themselves an admin from the app: learners may update only their own settings
-- columns. Granting the role is done in the SQL editor (see supabase/setup/make-admin.sql).

alter table public.profiles
  add column role text not null default 'student' check (role in ('student', 'admin'));

-- Column-level rights: a learner can change their settings, nothing else on their profile
-- (not their role, email or id).
revoke insert, update on public.profiles from anon, authenticated;
grant update (display_name, timezone, email_nudges, nudge_hour, app_state) on public.profiles to authenticated;

-- Whether the signed-in user is an admin. SECURITY DEFINER so policies can call it without
-- tripping over the profiles policies themselves.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Read-only access for admins (each table keeps its "own rows" policies for everyone).
create policy "admins read" on public.profiles for select to authenticated using ((select public.is_admin()));
create policy "admins read" on public.enrollments for select to authenticated using ((select public.is_admin()));
create policy "admins read" on public.block_progress for select to authenticated using ((select public.is_admin()));
create policy "admins read" on public.day_progress for select to authenticated using ((select public.is_admin()));
create policy "admins read" on public.study_days for select to authenticated using ((select public.is_admin()));
create policy "admins read" on public.checkpoints for select to authenticated using ((select public.is_admin()));
create policy "admins read" on public.checkpoint_attempts for select to authenticated using ((select public.is_admin()));
