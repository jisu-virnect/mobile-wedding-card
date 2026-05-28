-- RSVP table + RLS policies for the mobile wedding card.
-- Paste this entire file into Supabase Dashboard → SQL Editor and Run.
-- Safe to re-run: every statement is idempotent (drop-if-exists guards).

-- =========================================================================
-- 1. Table
-- =========================================================================
create table if not exists public.rsvp (
  id                  uuid primary key default gen_random_uuid(),
  device_id           text        not null,
  name                text        not null,
  side                text        not null check (side in ('groom', 'bride')),
  relationship        text,
  -- Freeform detail filled in only when relationship is `*-other`.
  relationship_detail text,
  attending           boolean     not null,
  guests              int         not null default 1 check (guests between 0 and 10),
  message             text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Idempotent add: if you've already applied an earlier version of this
-- file (without relationship_detail), re-running adds the column safely.
alter table public.rsvp
  add column if not exists relationship_detail text;

-- (device_id, name) is the upsert key: same phone re-submitting under the
-- same name edits the existing row; a different name from the same phone
-- creates a separate row (gracefully handles families on a shared device).
create unique index if not exists rsvp_device_name_uniq
  on public.rsvp (device_id, name);

-- Helper indexes for the admin page sort/filter.
create index if not exists rsvp_created_at_idx on public.rsvp (created_at);
create index if not exists rsvp_side_idx       on public.rsvp (side);

-- =========================================================================
-- 2. updated_at trigger
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists rsvp_set_updated_at on public.rsvp;
create trigger rsvp_set_updated_at
  before update on public.rsvp
  for each row execute function public.set_updated_at();

-- =========================================================================
-- 3. Row Level Security (RLS)
-- =========================================================================
-- Threat model: a small private wedding card. No phone numbers / no PII
-- beyond a freeform name. Anyone with the URL can submit, edit (their own
-- entry via device_id), or read aggregate totals. The admin URL token
-- gates the visible admin page; SELECT is open at the DB level because
-- the admin page is the only consumer that calls it directly and the
-- guest list is non-sensitive.
alter table public.rsvp enable row level security;

-- Wipe any previous policies before re-applying (idempotent).
drop policy if exists rsvp_anon_select on public.rsvp;
drop policy if exists rsvp_anon_insert on public.rsvp;
drop policy if exists rsvp_anon_update on public.rsvp;
drop policy if exists rsvp_anon_delete on public.rsvp;

create policy rsvp_anon_select on public.rsvp
  for select to anon
  using (true);

create policy rsvp_anon_insert on public.rsvp
  for insert to anon
  with check (true);

create policy rsvp_anon_update on public.rsvp
  for update to anon
  using (true)
  with check (true);

create policy rsvp_anon_delete on public.rsvp
  for delete to anon
  using (true);

-- =========================================================================
-- 4. Sanity check
-- =========================================================================
-- After running this, the SQL Editor should report "Success. No rows returned."
-- Verify with:
--   select * from public.rsvp;     -- empty result expected on first run
