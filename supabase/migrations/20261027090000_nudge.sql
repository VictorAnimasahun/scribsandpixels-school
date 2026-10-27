-- Nudge: life trackers (27 Oct 2026; plan in docs/nudge-plan.md).
--
-- A learner's own trackers (presets they switched on, and ones they made) and one value per
-- tracker per day. Life data is private: an admin can read it only while the learner has
-- switched on "share with my coach" (profiles.share_life_with_admin). Turning it off hides it
-- again at once, because every read checks the switch.

-- Consent ---------------------------------------------------------------------

alter table public.profiles
  add column share_life_with_admin boolean not null default false;

-- Learners set it themselves, like their other settings (the roles migration limits which
-- profile columns they may update; this adds one more).
grant update (share_life_with_admin) on public.profiles to authenticated;

-- Trackers ----------------------------------------------------------------------

create table public.nudge_trackers (
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- A preset id ('water', 'sleep', …) or a learner-made one ('c-' + 8 characters).
  tracker_id text not null check (tracker_id ~ '^([a-z]{3,10}|c-[0-9a-z]{8})$'),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  kind text not null check (kind in ('check', 'count', 'number', 'scale', 'duration')),
  unit text not null default '' check (char_length(unit) <= 12),
  -- The goal: all three set, or none (no goal).
  target_direction text check (target_direction in ('atLeast', 'atMost')),
  target_value double precision check (target_value between -1000000 and 1000000),
  target_per text check (target_per in ('day', 'week')),
  sort_order smallint not null default 0 check (sort_order between 0 and 500),
  enabled boolean not null default true,
  reminder_hour smallint check (reminder_hour between 0 and 23),
  updated_at timestamptz not null default now(),
  primary key (user_id, tracker_id),
  constraint target_all_or_nothing check (
    (target_direction is null) = (target_value is null) and (target_value is null) = (target_per is null)
  )
);

-- No learner keeps hundreds of trackers; this stops a script filling the table.
create function public.limit_nudge_trackers()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.nudge_trackers where user_id = new.user_id) >= 60 then
    raise exception 'too many trackers (60 at most)';
  end if;
  return new;
end;
$$;

create trigger nudge_trackers_limit
  before insert on public.nudge_trackers
  for each row execute function public.limit_nudge_trackers();

-- Entries -------------------------------------------------------------------------

-- One value per tracker per local date ('YYYY-MM-DD' in the learner's own calendar).
create table public.nudge_entries (
  user_id uuid not null,
  tracker_id text not null,
  logged_on date not null check (logged_on between date '2020-01-01' and date '2100-01-01'),
  value double precision not null check (value between -1000000 and 1000000),
  updated_at timestamptz not null default now(),
  primary key (user_id, tracker_id, logged_on),
  -- Deleting a tracker deletes its entries.
  foreign key (user_id, tracker_id) references public.nudge_trackers (user_id, tracker_id) on delete cascade
);

-- Insights read the last few weeks of every tracker.
create index nudge_entries_recent_idx on public.nudge_entries (user_id, logged_on);

-- Row level security ---------------------------------------------------------------

-- Whether the owner of `uid`'s rows lets the signed-in admin read them. SECURITY DEFINER, like
-- is_admin(), so the policy can read the switch without tripping over the profiles policies.
create function public.can_read_life_of(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() and exists (select 1 from public.profiles where id = uid and share_life_with_admin)
$$;

revoke execute on function public.can_read_life_of(uuid) from public, anon;
grant execute on function public.can_read_life_of(uuid) to authenticated;

alter table public.nudge_trackers enable row level security;
alter table public.nudge_entries enable row level security;

create policy "own rows" on public.nudge_trackers
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.nudge_entries
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "admins read with consent" on public.nudge_trackers
  for select to authenticated using (public.can_read_life_of(user_id));
create policy "admins read with consent" on public.nudge_entries
  for select to authenticated using (public.can_read_life_of(user_id));
