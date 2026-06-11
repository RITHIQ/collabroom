-- Supabase schema for ColabRoom (minimal, extend as needed)
-- Run this in Supabase SQL Editor.

-- Profiles
create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  bio text,
  tagline text,
  location text,
  languages text[] default '{}'::text[],
  niches text[] default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_name text,
  handle text unique,
  industry text,
  company_size text,
  website text,
  description text,
  preferred_niches text[] default '{}'::text[],
  preferred_platforms text[] default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Campaigns
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  niche text,
  platforms text[] default '{}'::text[],
  content_formats text[] default '{}'::text[],
  start_date date,
  end_date date,
  budget numeric,
  currency text default 'INR',
  status text default 'active',
  visibility text default 'public',
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  created_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);

-- Contracts
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete set null,
  brand_id uuid not null references auth.users(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete cascade,
  status text default 'draft',
  content jsonb default '{}'::jsonb,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Wallet
create table if not exists public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available_balance numeric not null default 0,
  pending_balance numeric not null default 0,
  locked_balance numeric not null default 0,
  currency text not null default 'INR',
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  amount numeric not null,
  method text,
  status text default 'pending',
  created_at timestamptz not null default now()
);

-- Social connections + stats snapshots
create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, -- 'youtube' | 'instagram'
  provider_user_id text,
  handle text,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scopes text[] default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.social_stats_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  followers bigint,
  views bigint,
  posts bigint,
  raw jsonb default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

-- RLS
alter table public.creators enable row level security;
alter table public.brands enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_applications enable row level security;
alter table public.contracts enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.social_connections enable row level security;
alter table public.social_stats_snapshots enable row level security;

-- Policies: minimal safe defaults
create policy "Creators readable by all" on public.creators for select using (true);
create policy "Brands readable by all" on public.brands for select using (true);
create policy "Campaigns readable by all" on public.campaigns for select using (true);

create policy "Creator can upsert own profile" on public.creators
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Brand can upsert own profile" on public.brands
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "User can view own wallet" on public.wallets
  for select using (auth.uid() = user_id);
create policy "User can update own wallet" on public.wallets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "User can view own wallet tx" on public.wallet_transactions
  for select using (auth.uid() = user_id);
create policy "User can insert own wallet tx" on public.wallet_transactions
  for insert with check (auth.uid() = user_id);

create policy "User can apply to campaigns" on public.campaign_applications
  for insert with check (auth.uid() = user_id);
create policy "User can view own applications" on public.campaign_applications
  for select using (auth.uid() = user_id);

create policy "User can view own contracts" on public.contracts
  for select using (auth.uid() = creator_id or auth.uid() = brand_id);
create policy "User can update own contracts" on public.contracts
  for update using (auth.uid() = creator_id or auth.uid() = brand_id);

create policy "User manages own social connections" on public.social_connections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "User can view own snapshots" on public.social_stats_snapshots
  for select using (auth.uid() = user_id);

