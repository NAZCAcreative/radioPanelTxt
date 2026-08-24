-- panelogue: shared debate replays
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query > Run).

create table if not exists shared_debates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  topic text not null,
  -- Everything needed to render a read-only replay: settings (with apiKey
  -- stripped client-side before upload), messages, claims, decision logs,
  -- stance history, reflections, consensus snapshots, final stances. Kept
  -- as one JSON blob instead of separate columns so the shape can evolve
  -- without a migration each time.
  payload jsonb not null
);

alter table shared_debates enable row level security;

-- Anyone holding the publishable key (i.e. anyone using the app) can create
-- a share link. There is no update/delete policy, so a share is immutable
-- once created - and no per-user ownership model yet, so anyone with a
-- share's id can read it (the id itself, a random UUID, is the access
-- control - same model as an unlisted link).
create policy "Anyone can create a shared debate"
  on shared_debates for insert
  to anon
  with check (true);

create policy "Anyone can read a shared debate by id"
  on shared_debates for select
  to anon
  using (true);
