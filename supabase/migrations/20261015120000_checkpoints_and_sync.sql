-- Accounts for the test build (15 Oct 2026).
-- The app keeps progress in the browser and mirrors it here once the learner signs in
-- (src/viewer/sync.ts). These tables hold what the first migration had no place for:
-- study dates, checkpoints (the random daily gate and the auto-marked week quiz) and their
-- attempts, and a few small app settings.

-- Study days ---------------------------------------------------------------

-- A local date ('YYYY-MM-DD', the learner's own calendar) on which they ticked at least one
-- block. The streak is built from these.
create table public.study_days (
  user_id uuid not null references public.profiles (id) on delete cascade,
  studied_on date not null,
  primary key (user_id, studied_on)
);

-- Checkpoints ----------------------------------------------------------------

-- kind 'gate': the daily checkpoint, key 'course:week:day'.
-- kind 'week': the week quiz, key 'course:week'.
create table public.checkpoints (
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('gate', 'week')),
  key text not null,
  -- When it popped up; a gate locks the app from then until it's passed.
  triggered_at timestamptz not null default now(),
  -- Question ids shown so far, oldest first, so retries draw new questions.
  seen text[] not null default '{}',
  primary key (user_id, kind, key),
  constraint checkpoint_key_shape check (
    (kind = 'gate' and key ~ '^[a-z0-9-]+:[0-9]{1,2}:[1-6]$') or
    (kind = 'week' and key ~ '^[a-z0-9-]+:[0-9]{1,2}$')
  ),
  constraint seen_not_huge check (cardinality(seen) <= 2000)
);

-- One row per attempt, numbered from 1 in the order they were started.
-- Starting an attempt saves it straight away as a fail (score 0); finishing replaces that
-- with the real result. So reloading mid-quiz can't dodge the cooldown.
create table public.checkpoint_attempts (
  user_id uuid not null,
  kind text not null,
  key text not null,
  attempt smallint not null check (attempt between 1 and 500),
  finished_at timestamptz not null,
  passed boolean not null,
  score real not null check (score >= 0 and score <= 1),
  primary key (user_id, kind, key, attempt),
  foreign key (user_id, kind, key) references public.checkpoints (user_id, kind, key) on delete cascade
);

create index checkpoint_attempts_passed_idx on public.checkpoint_attempts (user_id, kind, key) where passed;

-- An attempt can be rewritten only while it is still the provisional "started" fail
-- (not passed, score 0), and only to give it its result. A finished result is permanent,
-- and attempts can't be deleted, so a learner can't erase a fail to skip a cooldown.
-- Deleting an account still removes everything (auth.users → profiles → checkpoints →
-- attempts cascade): a delete is let through when its checkpoint is already gone.
create function public.guard_checkpoint_attempt()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if not exists (
      select 1 from public.checkpoints c
      where c.user_id = old.user_id and c.kind = old.kind and c.key = old.key
    ) then
      return old; -- the checkpoint itself is being deleted (account removal)
    end if;
    raise exception 'checkpoint attempts are permanent';
  end if;
  if old.passed or old.score <> 0 then
    raise exception 'a finished checkpoint attempt can''t be changed';
  end if;
  if new.user_id <> old.user_id or new.kind <> old.kind or new.key <> old.key or new.attempt <> old.attempt then
    raise exception 'an attempt can''t be moved';
  end if;
  return new;
end;
$$;

create trigger checkpoint_attempts_guard
  before update or delete on public.checkpoint_attempts
  for each row execute function public.guard_checkpoint_attempt();

-- Checkpoints themselves can't be deleted by a learner either (that would cascade away the
-- attempts); account deletion still removes them through profiles.
-- (No delete policy below means RLS refuses learner deletes.)

-- Small app settings ---------------------------------------------------------

-- { "activeCourse": "french", "bestScores": { "<quiz key>": 0.9, … } }
alter table public.profiles
  add column app_state jsonb not null default '{}'
  constraint app_state_is_object check (jsonb_typeof(app_state) = 'object' and pg_column_size(app_state) < 65536);

-- Row level security -----------------------------------------------------------

alter table public.study_days enable row level security;
alter table public.checkpoints enable row level security;
alter table public.checkpoint_attempts enable row level security;

create policy "own rows" on public.study_days
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "read own" on public.checkpoints
  for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own" on public.checkpoints
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own" on public.checkpoints
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "read own" on public.checkpoint_attempts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "insert own" on public.checkpoint_attempts
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "update own" on public.checkpoint_attempts
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
