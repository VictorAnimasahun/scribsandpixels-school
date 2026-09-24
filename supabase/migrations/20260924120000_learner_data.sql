-- Learner data for Scribs & Pixels School.
-- Course content lives in the repo (src/content); rows here point at it by
-- course slug + week number + day number (+ block key).

-- Profiles ---------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  timezone text not null default 'Africa/Lagos',
  email_nudges boolean not null default true,
  -- Local hour (0–23) for the daily nudge; evenings suit learners with day jobs.
  nudge_hour smallint not null default 19 check (nudge_hour between 0 and 23),
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enrollment and progress -----------------------------------------------

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_slug text not null,
  started_on date not null default current_date,
  status text not null default 'active' check (status in ('active', 'paused', 'finished')),
  created_at timestamptz not null default now(),
  unique (user_id, course_slug)
);

-- A ticked-off block within a day (review, lesson, practice, …).
create table public.block_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_slug text not null,
  week smallint not null check (week >= 1),
  day smallint not null check (day between 1 and 6),
  block_key text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, course_slug, week, day, block_key)
);

-- A finished day. Its completed_at drives streaks and the week dots.
create table public.day_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_slug text not null,
  week smallint not null check (week >= 1),
  day smallint not null check (day between 1 and 6),
  completed_at timestamptz not null default now(),
  primary key (user_id, course_slug, week, day)
);

-- Daily log: the three sentences. Day 7 is the Sunday weekly review, whose
-- extra prompts go in `answers`.
create table public.logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_slug text not null,
  week smallint not null check (week >= 1),
  day smallint not null check (day between 1 and 7),
  learned text not null default '',
  confused text not null default '',
  review_tomorrow text not null default '',
  answers jsonb not null default '{}',
  -- "Things That Confused Me" is the list of non-empty `confused` entries;
  -- this marks one as since understood.
  confusion_resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_slug, week, day)
);

-- Self-marked week quiz. `answers` is [{questionId, answer, gotIt}].
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_slug text not null,
  week smallint not null check (week >= 1),
  answers jsonb not null,
  score smallint not null,
  total smallint not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index quiz_attempts_passed_idx on public.quiz_attempts (user_id, course_slug, week) where passed;

-- Running notes ------------------------------------------------------------

create table public.wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_slug text,
  note text not null check (note <> ''),
  created_at timestamptz not null default now()
);

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  applied_on date not null default current_date,
  company text not null,
  role text not null,
  platform text not null default '',
  status text not null default 'applied'
    check (status in ('applied', 'interviewing', 'offer', 'rejected', 'no-response', 'withdrawn')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Emails -------------------------------------------------------------------

-- One row per email sent, so the hourly job never sends the same nudge twice.
-- Written only by the send-nudges edge function (service role).
create table public.email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('daily-nudge', 'weekly-review')),
  sent_on date not null,
  resend_id text,
  created_at timestamptz not null default now(),
  unique (user_id, kind, sent_on)
);

-- updated_at -------------------------------------------------------------

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger logs_touch before update on public.logs
  for each row execute function public.touch_updated_at();
create trigger job_applications_touch before update on public.job_applications
  for each row execute function public.touch_updated_at();

-- Row level security: every learner sees and edits only their own rows. ----

alter table public.profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.block_progress enable row level security;
alter table public.day_progress enable row level security;
alter table public.logs enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.wins enable row level security;
alter table public.job_applications enable row level security;
alter table public.email_events enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own rows" on public.enrollments
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.block_progress
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.day_progress
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.logs
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.wins
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.job_applications
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Quiz attempts are append-only: a learner can't rewrite a past result.
create policy "own rows" on public.quiz_attempts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own" on public.quiz_attempts
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "read own" on public.email_events
  for select to authenticated using (user_id = (select auth.uid()));
