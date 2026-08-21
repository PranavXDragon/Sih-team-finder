-- Add program column to seekers table
alter table seekers add column if not exists program text;
