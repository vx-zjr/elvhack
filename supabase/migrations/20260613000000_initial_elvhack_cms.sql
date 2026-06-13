create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  github_username text primary key,
  created_at timestamptz not null default now()
);

insert into public.admin_users (github_username)
values ('vx-zjr')
on conflict (github_username) do nothing;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null default '' check (char_length(excerpt) <= 280),
  content text not null,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  author_github_username text not null,
  updated_by_github_username text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx on public.posts (status, published_at desc);
create index if not exists posts_slug_idx on public.posts (slug);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 32),
  created_at timestamptz not null default now()
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  target_type text not null default 'post' check (target_type in ('post', 'project')),
  target_slug text,
  author_name text not null check (char_length(author_name) between 1 and 80),
  author_email text,
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  moderated_by_github_username text,
  check (post_id is not null or target_slug is not null)
);

create index if not exists comments_post_status_idx on public.comments (post_id, status, created_at desc);
create index if not exists comments_target_status_idx on public.comments (target_type, target_slug, status, created_at desc);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  target_type text not null default 'post' check (target_type in ('post', 'project')),
  target_slug text,
  anonymous_id uuid,
  kind text not null check (kind in ('like', 'spark', 'useful', 'mindblown')),
  created_at timestamptz not null default now(),
  check (post_id is not null or target_slug is not null)
);

create index if not exists reactions_post_kind_idx on public.reactions (post_id, kind);
create index if not exists reactions_target_kind_idx on public.reactions (target_type, target_slug, kind);
create unique index if not exists reactions_unique_anonymous_target_idx
  on public.reactions (target_type, coalesce(target_slug, ''), coalesce(post_id, '00000000-0000-0000-0000-000000000000'::uuid), kind, anonymous_id)
  where anonymous_id is not null;

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null check (char_length(path) between 1 and 240),
  post_slug text,
  referrer text,
  user_agent_family text not null default 'unknown',
  created_at timestamptz not null default now()
);

create index if not exists page_views_path_created_idx on public.page_views (path, created_at desc);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_github_username text not null,
  action text not null,
  subject_type text not null,
  subject_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.page_views enable row level security;
alter table public.audit_events enable row level security;

create policy "Published posts are public"
  on public.posts for select
  using (status = 'published');

create policy "Approved comments are public"
  on public.comments for select
  using (status = 'approved');

create policy "Tags are public"
  on public.tags for select
  using (true);

create policy "Post tags are public"
  on public.post_tags for select
  using (true);

create policy "Service role owns CMS tables"
  on public.posts for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role owns comments"
  on public.comments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role owns reactions"
  on public.reactions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role owns page views"
  on public.page_views for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role owns audit events"
  on public.audit_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
before update on public.posts
for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();
