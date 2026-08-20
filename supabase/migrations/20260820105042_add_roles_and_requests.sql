-- Add user_id to teams
alter table teams add column user_id uuid references auth.users(id);

-- Add user_id to seekers
alter table seekers add column user_id uuid references auth.users(id);

-- Create join_requests table
create table join_requests (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  seeker_id uuid references seekers(id) on delete cascade,
  status text default 'pending' not null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);
