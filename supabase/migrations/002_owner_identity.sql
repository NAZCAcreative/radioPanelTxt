-- panelogue: attach a per-API-key pseudonymous owner to shared debates
-- Run in the Supabase SQL Editor (or via the same channel 001/schema.sql was applied through).

alter table shared_debates
  add column if not exists owner_key_hash text,
  add column if not exists owner_name text;

-- Powers "내 토론 목록": listing every share created under the same
-- (hashed) API key without a full accounts/auth system.
create index if not exists shared_debates_owner_key_hash_idx
  on shared_debates (owner_key_hash);
