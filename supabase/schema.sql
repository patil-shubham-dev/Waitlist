-- LifeOS Waitlist
-- Run this in the Supabase SQL editor for the WaitlistApp project.
-- Safe to re-run.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text check (role in ('student', 'founder', 'creator', 'operator', 'professional', 'other')),
  interest_level text check (interest_level in ('high', 'medium', 'low')) default 'high',
  referrer text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

drop policy if exists "waitlist_public_insert" on public.waitlist;
create policy "waitlist_public_insert"
on public.waitlist
for insert
to anon, authenticated
with check (true);

drop policy if exists "waitlist_public_count" on public.waitlist;
create policy "waitlist_public_count"
on public.waitlist
for select
to anon, authenticated
using (true);

create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  page text not null default '/',
  referrer text,
  country text,
  device text,
  created_at timestamptz not null default now()
);

alter table public.page_visits enable row level security;

drop policy if exists "visits_public_insert" on public.page_visits;
create policy "visits_public_insert"
on public.page_visits
for insert
to anon, authenticated
with check (true);

create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null check (status in ('past', 'present', 'future')) default 'future',
  sort_order integer not null default 0,
  items text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists timeline_entries_updated_at on public.timeline_entries;
create trigger timeline_entries_updated_at
before update on public.timeline_entries
for each row
execute function public.set_updated_at();

alter table public.timeline_entries enable row level security;

drop policy if exists "timeline_public_read" on public.timeline_entries;
create policy "timeline_public_read"
on public.timeline_entries
for select
to anon, authenticated
using (true);

create table if not exists public.site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at
before update on public.site_content
for each row
execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "site_content_public_read" on public.site_content;
create policy "site_content_public_read"
on public.site_content
for select
to anon, authenticated
using (true);

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text not null,
  type text not null check (type in ('question', 'suggestion', 'feedback')) default 'question',
  status text not null check (status in ('open', 'reviewing', 'answered', 'planned')) default 'open',
  name text,
  email text not null,
  author_name text generated always as (coalesce(nullif(name, ''), split_part(email, '@', 1))) stored,
  author_avatar_url text not null default '/assets/default-avatar.svg',
  admin_name text,
  admin_avatar_url text,
  admin_response text,
  admin_responded_at timestamptz,
  is_featured boolean not null default false,
  is_public boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.suggestions
  add column if not exists title text,
  add column if not exists type text check (type in ('question', 'suggestion', 'feedback')) default 'question',
  add column if not exists status text check (status in ('open', 'reviewing', 'answered', 'planned')) default 'open',
  add column if not exists author_avatar_url text default '/assets/default-avatar.svg',
  add column if not exists admin_name text,
  add column if not exists admin_avatar_url text,
  add column if not exists is_public boolean default true,
  add column if not exists tags text[] default '{}',
  add column if not exists updated_at timestamptz default now();

drop trigger if exists suggestions_updated_at on public.suggestions;
create trigger suggestions_updated_at
before update on public.suggestions
for each row
execute function public.set_updated_at();

alter table public.suggestions enable row level security;

drop policy if exists "suggestions_public_insert" on public.suggestions;
create policy "suggestions_public_insert"
on public.suggestions
for insert
to anon, authenticated
with check (email is not null and char_length(trim(content)) > 0);

drop policy if exists "suggestions_public_read" on public.suggestions;
create policy "suggestions_public_read"
on public.suggestions
for select
to anon, authenticated
using (is_public = true);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  detail text not null,
  actor text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

insert into public.timeline_entries (title, description, status, sort_order, items)
select
  'Foundation',
  'The product direction is clear: turn social energy into real execution.',
  'past',
  1,
  array[
    'Proof-first productivity system',
    'Feed built for momentum instead of distraction',
    'Realtime waitlist and launch stack'
  ]
where not exists (
  select 1 from public.timeline_entries where title = 'Foundation'
);

insert into public.timeline_entries (title, description, status, sort_order, items)
select
  'Core Loop',
  'Consume, act, prove, earn, show, repeat.',
  'present',
  2,
  array[
    'Task execution with AI-rated difficulty',
    'Proof validation and trust signals',
    'Streaks, levels, and social motivation'
  ]
where not exists (
  select 1 from public.timeline_entries where title = 'Core Loop'
);

insert into public.timeline_entries (title, description, status, sort_order, items)
select
  'Social Layer',
  'Communities, proof sharing, and public progress identity.',
  'future',
  3,
  array[
    'Community roles and moderation',
    'Post and story publishing',
    'Progress identity with tiers and vault'
  ]
where not exists (
  select 1 from public.timeline_entries where title = 'Social Layer'
);

insert into public.timeline_entries (title, description, status, sort_order, items)
select
  'Public Beta',
  'Launch the first complete LifeOS experience for disciplined builders.',
  'future',
  4,
  array[
    'Founding member onboarding',
    'Proof system hardening',
    'Analytics, safety, and premium polish'
  ]
where not exists (
  select 1 from public.timeline_entries where title = 'Public Beta'
);

insert into public.site_content (key, value)
values
  ('nav_cta', 'Join the founding waitlist'),
  ('hero_badge', 'LifeOS Social - premium launch'),
  ('hero_title', 'The social operating system for people who want proof, progress, and momentum.'),
  ('hero_subtext', 'LifeOS turns daily action into visible growth. Plan your work, prove what you finished, earn momentum, and stay surrounded by people who are moving forward too.'),
  ('hero_primary_cta', 'Join the waitlist'),
  ('hero_secondary_cta', 'See the product story'),
  ('problem_title', 'Why LifeOS exists'),
  ('problem_body', 'Most productivity apps help you plan. Most social apps help you escape. LifeOS is built to help you act, verify progress, and come back tomorrow stronger.'),
  ('questions_title', 'Questions, ideas, and launch feedback'),
  ('questions_body', 'Visitors can ask questions, suggest improvements, and follow the product journey. Replies from the team stay visible to everyone.'),
  ('waitlist_title', 'Get early access to LifeOS'),
  ('waitlist_body', 'Join the founding list for launch updates, beta access, and roadmap drops.'),
  ('footer_tagline', 'Built for disciplined students, founders, creators, and builders.'),
  ('brand_reply_name', 'LifeOS Team'),
  ('reply_logo_url', '/assets/logo-mark.svg'),
  ('brand_wordmark_url', '/assets/logo-wordmark.svg')
on conflict (key) do nothing;

insert into public.suggestions (title, content, type, status, name, email, is_featured, admin_name, admin_avatar_url, admin_response, admin_responded_at, tags)
select
  'Will LifeOS only be for students?',
  'I want to know whether founders and creators can use the first version too.',
  'question',
  'answered',
  'Aarav',
  'aarav@example.com',
  true,
  'LifeOS Team',
  '/assets/logo-mark.svg',
  'Students are a key launch audience, but the product is being designed for anyone who wants structured execution, proof, and social motivation.',
  now(),
  array['launch', 'audience']
where not exists (
  select 1 from public.suggestions where email = 'aarav@example.com'
);

create index if not exists idx_waitlist_created_at on public.waitlist (created_at desc);
create index if not exists idx_suggestions_public_created on public.suggestions (is_public, created_at desc);
create index if not exists idx_page_visits_created_at on public.page_visits (created_at desc);
create index if not exists idx_timeline_entries_sort_order on public.timeline_entries (sort_order asc);
