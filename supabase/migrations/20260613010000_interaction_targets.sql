alter table public.comments
  alter column post_id drop not null,
  add column if not exists target_type text not null default 'post',
  add column if not exists target_slug text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'comments_target_type_check'
  ) then
    alter table public.comments
      add constraint comments_target_type_check check (target_type in ('post', 'project'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'comments_target_required_check'
  ) then
    alter table public.comments
      add constraint comments_target_required_check check (post_id is not null or target_slug is not null);
  end if;
end $$;

create index if not exists comments_target_status_idx on public.comments (target_type, target_slug, status, created_at desc);

alter table public.reactions
  alter column post_id drop not null,
  add column if not exists target_type text not null default 'post',
  add column if not exists target_slug text,
  add column if not exists anonymous_id uuid;

alter table public.reactions
  drop constraint if exists reactions_kind_check;

alter table public.reactions
  add constraint reactions_kind_check check (kind in ('like', 'spark', 'useful', 'mindblown'));

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reactions_target_type_check'
  ) then
    alter table public.reactions
      add constraint reactions_target_type_check check (target_type in ('post', 'project'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'reactions_target_required_check'
  ) then
    alter table public.reactions
      add constraint reactions_target_required_check check (post_id is not null or target_slug is not null);
  end if;
end $$;

create index if not exists reactions_target_kind_idx on public.reactions (target_type, target_slug, kind);
create unique index if not exists reactions_unique_anonymous_target_idx
  on public.reactions (target_type, coalesce(target_slug, ''), coalesce(post_id, '00000000-0000-0000-0000-000000000000'::uuid), kind, anonymous_id)
  where anonymous_id is not null;
