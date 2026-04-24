-- LifeOS Waitlist — Supabase Schema
-- Run this full file in Supabase SQL editor (safe to re-run)

-- ─────────────────────────────────────────
-- WAITLIST TABLE
-- ─────────────────────────────────────────
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  role text check (role in ('student', 'professional', 'creator', 'other', 'founder')),
  interest_level text check (interest_level in ('high', 'medium', 'low')) default 'high',
  referrer text,
  approved boolean default false,
  created_at timestamp with time zone default now()
);

-- Add approved column if running on existing DB
alter table waitlist add column if not exists approved boolean default false;

alter table waitlist enable row level security;

create policy if not exists "public_insert_waitlist" on waitlist
  for insert with check (true);

create policy if not exists "admin_read_waitlist" on waitlist
  for select using (auth.role() = 'authenticated');

create policy if not exists "admin_update_waitlist" on waitlist
  for update using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- SUGGESTIONS TABLE
-- ─────────────────────────────────────────
create table if not exists suggestions (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  content text not null,
  rating integer check (rating >= 1 and rating <= 5),
  category text check (category in ('feature', 'design', 'general', 'bug')) default 'general',
  is_featured boolean default false,
  admin_response text,
  admin_responded_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table suggestions enable row level security;

create policy if not exists "public_insert_suggestions" on suggestions
  for insert with check (true);

create policy if not exists "public_read_featured" on suggestions
  for select using (is_featured = true);

create policy if not exists "admin_all_suggestions" on suggestions
  for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- PAGE VISITS TABLE
-- ─────────────────────────────────────────
create table if not exists page_visits (
  id uuid default gen_random_uuid() primary key,
  page text default '/',
  referrer text,
  country text,
  created_at timestamp with time zone default now()
);

alter table page_visits enable row level security;

create policy if not exists "public_insert_visits" on page_visits
  for insert with check (true);

create policy if not exists "admin_read_visits" on page_visits
  for select using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- TIMELINE ENTRIES TABLE (NEW — admin-controlled)
-- ─────────────────────────────────────────
create table if not exists timeline_entries (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text not null check (status in ('past', 'present', 'future')) default 'future',
  sort_order integer default 0,
  items text[],            -- array of bullet point strings
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table timeline_entries enable row level security;

-- Public can read all timeline entries
create policy if not exists "public_read_timeline" on timeline_entries
  for select using (true);

-- Only admin can modify
create policy if not exists "admin_all_timeline" on timeline_entries
  for all using (auth.role() = 'authenticated');

-- Seed with default data (only if table is empty)
insert into timeline_entries (title, description, status, sort_order, items)
select 'Foundation', 'Core platform built and deployed', 'past', 1,
  array['Task system', 'Social feed', 'User profiles', 'Communities', 'Direct messaging', 'Supabase backend']
where not exists (select 1 from timeline_entries);

insert into timeline_entries (title, description, status, sort_order, items)
select 'Security', 'Full security hardening pass', 'past', 2,
  array['Credential rotation', 'Edge Function migration', 'GP double-award fix', 'Daily cap enforcement', 'Admin auth hardening']
where not exists (select 1 from timeline_entries where title = 'Security');

insert into timeline_entries (title, description, status, sort_order, items)
select 'AI Proof System', 'Building now — shipping soon', 'present', 3,
  array['AI proof validator', 'Duplicate detection', 'EXIF validation', 'Confidence scoring', 'Behavioral analysis']
where not exists (select 1 from timeline_entries where title = 'AI Proof System');

insert into timeline_entries (title, description, status, sort_order, items)
select 'Gamification', 'Next milestone on the roadmap', 'future', 4,
  array['GP fraud prevention', 'Admin control panel', 'Streak grace logic', 'Monthly XP soft cap', 'Leaderboards']
where not exists (select 1 from timeline_entries where title = 'Gamification');

insert into timeline_entries (title, description, status, sort_order, items)
select 'Scale & Polish', 'Infrastructure and compliance', 'future', 5,
  array['RBAC for admin team', 'GDPR data export', 'TypeScript conversion', 'Mobile app', 'Performance audit']
where not exists (select 1 from timeline_entries where title = 'Scale & Polish');

insert into timeline_entries (title, description, status, sort_order, items)
select 'Public Beta', 'Official launch to the world', 'future', 6,
  array['Open beta launch', 'Premium communities', 'AI coaching', 'Feed ad system', 'Analytics v2']
where not exists (select 1 from timeline_entries where title = 'Public Beta');

-- ─────────────────────────────────────────
-- SITE CONTENT TABLE (admin-editable copy)
-- ─────────────────────────────────────────
create table if not exists site_content (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default now()
);

alter table site_content enable row level security;

create policy if not exists "public_read_content" on site_content
  for select using (true);

create policy if not exists "admin_all_content" on site_content
  for all using (auth.role() = 'authenticated');

-- Default content
insert into site_content (key, value) values
  ('hero_headline', 'The operating system for your life.'),
  ('hero_subtext', 'LifeOS helps you go from scattered goals to consistent execution. Built for people who want results, not reminders.'),
  ('hero_cta', 'Get Early Access'),
  ('cta_headline', 'Ready to build the life you keep planning?'),
  ('cta_subtext', 'Join the waitlist. Be among the first to use LifeOS.')
on conflict (key) do nothing;

-- ─────────────────────────────────────────
-- REALTIME
-- Enable in Supabase Dashboard → Database → Replication:
-- waitlist, suggestions, page_visits, timeline_entries, site_content
-- ─────────────────────────────────────────
