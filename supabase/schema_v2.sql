-- ============================================================
-- ColabRoom Schema v2 — Additive migrations
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- 1. Base profiles table (stores role for every user)
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  role        text not null check (role in ('creator','brand','admin')) default 'creator',
  full_name   text,
  avatar_url  text,
  is_verified boolean not null default false,
  is_blocked  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Milestones per campaign
create table if not exists public.milestones (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  title           text not null,
  due_date        date,
  assigned_to     uuid references auth.users(id) on delete set null,
  status          text not null default 'pending' check (status in ('pending','in_progress','completed','late','disputed')),
  payment_amount  numeric not null default 0,
  currency        text not null default 'INR',
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- 3. Content submissions per milestone
create table if not exists public.content_submissions (
  id           uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  creator_id   uuid not null references auth.users(id) on delete cascade,
  files        text[] default '{}'::text[],
  caption      text,
  status       text not null default 'submitted' check (status in ('submitted','in_review','changes_requested','approved','published')),
  version      int not null default 1,
  feedback     text,
  live_url     text,
  submitted_at timestamptz not null default now()
);

-- 4. Notifications (per-user)
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  is_read    boolean not null default false,
  data       jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 5. Announcements (admin broadcasts)
create table if not exists public.announcements (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  body            text not null,
  target_audience text not null default 'all' check (target_audience in ('all','creators','brands')),
  created_by      uuid references auth.users(id) on delete set null,
  is_published    boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- 6. Disputes
create table if not exists public.disputes (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid references public.campaigns(id) on delete set null,
  raised_by    uuid not null references auth.users(id) on delete cascade,
  reason       text not null,
  evidence_urls text[] default '{}'::text[],
  status       text not null default 'open' check (status in ('open','under_review','resolved','closed')),
  resolution   text,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- 7. File uploads (track storage references)
create table if not exists public.file_uploads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  bucket      text not null default 'uploads',
  path        text not null,
  file_name   text,
  mime_type   text,
  size_bytes  bigint,
  created_at  timestamptz not null default now()
);

-- 8. Campaign applications status column (add if missing)
alter table public.campaign_applications
  add column if not exists status text not null default 'pending'
  check (status in ('pending','approved','rejected'));

alter table public.campaign_applications
  add column if not exists cover_letter text;

-- 9. Extend campaigns table
alter table public.campaigns
  add column if not exists type         text default 'sponsored_post',
  add column if not exists slug         text,
  add column if not exists brief        jsonb default '{}'::jsonb,
  add column if not exists deliverables text[] default '{}'::text[],
  add column if not exists slots_total  int default 5,
  add column if not exists slots_filled int default 0,
  add column if not exists brand_name   text,
  add column if not exists niche        text,
  add column if not exists applications_count int default 0;

-- 10. Extend contracts table
alter table public.contracts
  add column if not exists signed_by_brand_at   timestamptz,
  add column if not exists signed_by_creator_at timestamptz,
  add column if not exists pdf_url              text,
  add column if not exists brand_name           text,
  add column if not exists creator_name         text,
  add column if not exists total_amount         numeric default 0,
  add column if not exists currency             text default 'INR';

-- 11. Extend creators table with profile fields
alter table public.creators
  add column if not exists social_links   jsonb default '[]'::jsonb,
  add column if not exists pricing_tiers  jsonb default '[]'::jsonb,
  add column if not exists creator_score  int default 50,
  add column if not exists creator_tier   text default 'rising',
  add column if not exists portfolio_urls text[] default '{}'::text[],
  add column if not exists availability   text default 'available',
  add column if not exists campaigns_completed int default 0,
  add column if not exists on_time_delivery_rate numeric default 100,
  add column if not exists avg_response_time text default '< 24h',
  add column if not exists profile_photo text,
  add column if not exists cover_image   text,
  add column if not exists completion_percentage int default 0;

-- 12. Extend brands table
alter table public.brands
  add column if not exists logo_url           text,
  add column if not exists cover_image        text,
  add column if not exists brand_score        int default 50,
  add column if not exists brand_tier         text default 'new_brand',
  add column if not exists avg_payment_time   numeric default 7,
  add column if not exists campaigns_completed int default 0,
  add column if not exists on_time_payment_rate numeric default 100,
  add column if not exists values             text,
  add column if not exists completion_percentage int default 0;

-- ============================================================
-- RLS for new tables
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.milestones       enable row level security;
alter table public.content_submissions enable row level security;
alter table public.notifications    enable row level security;
alter table public.announcements    enable row level security;
alter table public.disputes         enable row level security;
alter table public.file_uploads     enable row level security;

-- profiles: user reads own; admin reads all
create policy "User can view own profile" on public.profiles
  for select using (auth.uid() = user_id);
create policy "User can update own profile" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "User can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "Admin reads all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );
create policy "Admin updates any profile" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

-- milestones: campaign parties can read; brand creates
create policy "Campaign parties view milestones" on public.milestones
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.brand_user_id = auth.uid()
    ) or assigned_to = auth.uid()
    or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );
create policy "Brand creates milestones" on public.milestones
  for insert with check (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.brand_user_id = auth.uid()
    )
  );
create policy "Brand updates milestones" on public.milestones
  for update using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.brand_user_id = auth.uid()
    )
  );

-- content_submissions
create policy "Creator manages own submissions" on public.content_submissions
  for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
create policy "Brand views submissions" on public.content_submissions
  for select using (
    exists (
      select 1 from public.milestones m
      join public.campaigns c on c.id = m.campaign_id
      where m.id = milestone_id and c.brand_user_id = auth.uid()
    )
  );
create policy "Brand updates submission status" on public.content_submissions
  for update using (
    exists (
      select 1 from public.milestones m
      join public.campaigns c on c.id = m.campaign_id
      where m.id = milestone_id and c.brand_user_id = auth.uid()
    )
  );

-- notifications: user reads/updates own
create policy "User views own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "User updates own notifications" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "System inserts notifications" on public.notifications
  for insert with check (true);

-- announcements: authenticated users read published; admin all
create policy "Authenticated read published announcements" on public.announcements
  for select using (is_published = true and auth.uid() is not null);
create policy "Admin manages announcements" on public.announcements
  for all using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

-- disputes: raiser creates, admin manages
create policy "User creates dispute" on public.disputes
  for insert with check (auth.uid() = raised_by);
create policy "User views own dispute" on public.disputes
  for select using (auth.uid() = raised_by);
create policy "Admin manages disputes" on public.disputes
  for all using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );

-- file_uploads
create policy "User manages own files" on public.file_uploads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Campaign parties view files" on public.file_uploads
  for select using (
    campaign_id is not null and exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and (c.brand_user_id = auth.uid())
    )
  );

-- ============================================================
-- Helper function: auto-create profile + wallet on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  _role text;
begin
  _role := coalesce((new.raw_user_meta_data->>'role')::text, 'creator');
  if _role not in ('creator','brand','admin') then
    _role := 'creator';
  end if;

  -- 1. Insert base profile
  insert into public.profiles (user_id, role, full_name)
  values (
    new.id,
    _role,
    coalesce(new.raw_user_meta_data->>'fullName', new.raw_user_meta_data->>'companyName', split_part(new.email,'@',1))
  )
  on conflict (user_id) do nothing;

  -- 2. Insert wallet
  insert into public.wallets (user_id, available_balance, pending_balance, locked_balance, currency)
  values (new.id, 0, 0, 0, 'INR')
  on conflict (user_id) do nothing;

  -- 3. Insert role-specific profile data (creators or brands)
  if _role = 'creator' then
    insert into public.creators (
      user_id,
      display_name,
      username,
      location,
      niches,
      languages
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'fullName', split_part(new.email,'@',1)),
      coalesce(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text from 1 for 8)),
      coalesce(new.raw_user_meta_data->>'country', 'India'),
      case 
        when new.raw_user_meta_data->>'niche' is not null and (new.raw_user_meta_data->>'niche') <> ''
        then array[new.raw_user_meta_data->>'niche'] 
        else '{}'::text[] 
      end,
      '{}'::text[]
    )
    on conflict (user_id) do nothing;
  elsif _role = 'brand' then
    insert into public.brands (
      user_id,
      company_name,
      handle,
      industry,
      company_size,
      website,
      description,
      preferred_niches,
      preferred_platforms
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'companyName', split_part(new.email,'@',1)),
      coalesce(new.raw_user_meta_data->>'handle', 'brand_' || substring(new.id::text from 1 for 8)),
      coalesce(new.raw_user_meta_data->>'industry', ''),
      coalesce(new.raw_user_meta_data->>'companySize', ''),
      coalesce(new.raw_user_meta_data->>'website', ''),
      '',
      '{}'::text[],
      '{}'::text[]
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DEMO ACCOUNTS SEED
-- Two pre-seeded accounts for college demo / presentations.
-- Emails use Supabase magic link — sign in with OTP to access.
-- ============================================================

-- Demo Creator Account seed (profile + creator row)
-- Email: demo.creator@colabroom.app
-- To use: sign in with OTP on the web/mobile app with this email
insert into public.profiles (user_id, role, full_name, is_verified)
select id, 'creator', 'Demo Creator (Priya Sharma)', true
from auth.users where email = 'demo.creator@colabroom.app'
on conflict (user_id) do update set role='creator', full_name='Demo Creator (Priya Sharma)', is_verified=true;

insert into public.creators (user_id, display_name, username, bio, tagline, location, niches, languages,
  social_links, pricing_tiers, creator_score, creator_tier, availability,
  campaigns_completed, on_time_delivery_rate, completion_percentage)
select
  id,
  'Priya Sharma',
  'priya.creates',
  'Lifestyle and beauty creator based in Mumbai. I partner with authentic brands that align with my values and audience.',
  'Authentic creator · 450K+ reach · Top-rated on ColabRoom',
  'Mumbai, India',
  ARRAY['Beauty','Lifestyle','Fashion'],
  ARRAY['English','Hindi'],
  '[{"platform":"instagram","handle":"@priya.creates","followers":280000,"engagementRate":4.8},{"platform":"youtube","handle":"Priya Sharma","followers":170000,"engagementRate":3.9}]'::jsonb,
  '[{"type":"story","label":"Instagram Story","minPrice":15000,"maxPrice":25000,"currency":"INR"},{"type":"reel","label":"Instagram Reel","minPrice":45000,"maxPrice":80000,"currency":"INR"},{"type":"youtube_video","label":"YouTube Integration","minPrice":90000,"maxPrice":180000,"currency":"INR"}]'::jsonb,
  92,
  'elite',
  'available',
  38,
  97,
  95
from auth.users where email = 'demo.creator@colabroom.app'
on conflict (user_id) do update set
  display_name='Priya Sharma', username='priya.creates', creator_score=92;

-- Demo Brand Account seed
-- Email: demo.brand@colabroom.app
insert into public.profiles (user_id, role, full_name, is_verified)
select id, 'brand', 'Demo Brand (StyleCo)', true
from auth.users where email = 'demo.brand@colabroom.app'
on conflict (user_id) do update set role='brand', full_name='Demo Brand (StyleCo)', is_verified=true;

insert into public.brands (user_id, company_name, handle, industry, company_size, website, description,
  preferred_niches, preferred_platforms, brand_score, brand_tier,
  avg_payment_time, campaigns_completed, on_time_payment_rate, completion_percentage)
select
  id,
  'StyleCo India',
  'styleco-india',
  'Fashion & Apparel',
  '51-200',
  'https://styleco.example.com',
  'India''s premium D2C fashion brand focused on sustainable everyday wear. We partner with creators who believe in conscious fashion.',
  ARRAY['Fashion','Lifestyle','Beauty'],
  ARRAY['instagram','youtube','tiktok'],
  85,
  'preferred',
  2.5,
  22,
  98,
  90
from auth.users where email = 'demo.brand@colabroom.app'
on conflict (user_id) do update set
  company_name='StyleCo India', handle='styleco-india', brand_score=85;

-- Demo wallets
insert into public.wallets (user_id, available_balance, pending_balance, locked_balance, currency)
select id, 48250, 7200, 5100, 'INR'
from auth.users where email = 'demo.creator@colabroom.app'
on conflict (user_id) do update set available_balance=48250, pending_balance=7200, locked_balance=5100;

insert into public.wallets (user_id, available_balance, pending_balance, locked_balance, currency)
select id, 250000, 0, 180000, 'INR'
from auth.users where email = 'demo.brand@colabroom.app'
on conflict (user_id) do update set available_balance=250000, locked_balance=180000;

-- Demo wallet transactions for creator
insert into public.wallet_transactions (user_id, type, amount, status, method)
select id, 'credit', 80000, 'completed', null
from auth.users where email = 'demo.creator@colabroom.app';

insert into public.wallet_transactions (user_id, type, amount, status, method)
select id, 'withdrawal', 20000, 'completed', 'upi'
from auth.users where email = 'demo.creator@colabroom.app';

-- Demo campaign (owned by brand account)
insert into public.campaigns (brand_user_id, title, description, niche, platforms, content_formats,
  start_date, end_date, budget, currency, status, visibility, type,
  deliverables, slots_total, slots_filled, brand_name, applications_count)
select
  id,
  'StyleCo Summer Collection Launch',
  'Looking for lifestyle and fashion creators to showcase our new summer collection. Authentic, aesthetic content preferred. Sustainable fashion angle is a plus.',
  'Fashion',
  ARRAY['instagram','youtube'],
  ARRAY['reel','story','feed_post'],
  current_date,
  current_date + interval '45 days',
  350000,
  'INR',
  'active',
  'public',
  'sponsored_post',
  ARRAY['2 Instagram Reels','4 Stories','1 Feed Post'],
  8,
  2,
  'StyleCo India',
  14
from auth.users where email = 'demo.brand@colabroom.app';

-- Demo announcement
insert into public.announcements (title, body, target_audience, is_published, published_at, created_by)
select
  'Welcome to ColabRoom!',
  'Thank you for joining ColabRoom — India''s creator economy platform. Complete your profile to get discovered by top brands and start collaborating today!',
  'all',
  true,
  now(),
  id
from auth.users where email = 'demo.brand@colabroom.app'
limit 1;
