-- VBC AI Studio — initial schema
-- Source: VBC AI Studio Master Strategy & Technical Blueprint, section
-- "Supabase Database Schema (Complete SQL DDL)". The blueprint's policy
-- list was cut off mid-document; the policies below complete the same
-- "owner can read/write their own rows" pattern for every table, plus the
-- insert/update/delete policies the blueprint didn't spell out.
--
-- Run via the Supabase CLI (`supabase db push`) or paste into the SQL
-- editor of a Supabase project. Nothing in this file talks to a live
-- database on its own — it only runs against a Supabase project you've
-- created and pointed this app at (see studio/.env.example).

-- 1. EXTENSIONS & ENUMS
create extension if not exists "uuid-ossp";

do $$ begin
  create type subscription_tier as enum ('free', 'pro', 'agency');
exception
  when duplicate_object then null;
end $$;

-- 2. USER PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  github_username text,
  github_access_token text, -- encrypted at the application layer before write
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SUBSCRIPTIONS & CREDIT LEDGER
create table if not exists public.user_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  tier subscription_tier default 'free'::subscription_tier not null,
  credit_balance integer default 30 not null,
  rollover_credits integer default 0 not null,
  credits_expire_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PROJECTS & WORKSPACES
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text not null,
  github_repo_name text,
  github_repo_owner text,
  github_default_branch text default 'main',
  is_public boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (owner_id, slug)
);

-- 5. CODE GUARD AUDIT & GENERATION LOGS
create table if not exists public.generation_logs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  prompt text not null,
  model_tier text, -- 'fast' | 'deep' — which router tier served this generation
  credits_deducted integer not null,
  code_guard_passed boolean not null,
  error_details text,
  commit_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.projects enable row level security;
alter table public.generation_logs enable row level security;

-- profiles: a user can read and update only their own row. Rows are
-- created by a trigger (below), never by direct client insert.
create policy "Users view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- user_subscriptions: readable by the owner; writes go through the
-- service role (credit ledger, Stripe webhooks), never directly from
-- the client, so there is no client-facing insert/update policy here.
create policy "Users view own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

-- projects: full CRUD, scoped to the owner.
create policy "Users view own projects"
  on public.projects for select
  using (auth.uid() = owner_id);

create policy "Users create own projects"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "Users update own projects"
  on public.projects for update
  using (auth.uid() = owner_id);

create policy "Users delete own projects"
  on public.projects for delete
  using (auth.uid() = owner_id);

-- generation_logs: readable by the user who triggered the generation.
-- Inserts happen server-side (service role) alongside the credit
-- deduction, so there's no client-facing insert policy.
create policy "Users view own generation logs"
  on public.generation_logs for select
  using (auth.uid() = user_id);

-- 7. NEW-USER PROVISIONING
-- Mirrors auth.users into public.profiles and opens a free-tier
-- subscription the moment someone signs up (via Supabase Auth /
-- GitHub OAuth), so the app never has to special-case a "no profile
-- yet" state.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, github_username)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'user_name'
  )
  on conflict (id) do nothing;

  insert into public.user_subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. INDEXES
create index if not exists projects_owner_id_idx on public.projects (owner_id);
create index if not exists generation_logs_project_id_idx on public.generation_logs (project_id);
create index if not exists generation_logs_user_id_idx on public.generation_logs (user_id);
