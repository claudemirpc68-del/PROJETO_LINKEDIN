-- Migration: make date column nullable to allow transition to scheduled_at
alter table calendar_posts 
  alter column date drop not null;

-- Optional: Copy data from date to scheduled_at if scheduled_at is null
update calendar_posts 
set scheduled_at = date::timestamptz 
where scheduled_at is null and date is not null;
