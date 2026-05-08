create table if not exists supabase_migrations (
  id bigint primary key,
  name text not null,
  executed_at timestamp with time zone default now()
);

-- Migration: add scheduled_at column and index
alter table calendar_posts
  add column scheduled_at timestamptz null;

create index if not exists idx_calendar_posts_scheduled_at on calendar_posts (scheduled_at);
