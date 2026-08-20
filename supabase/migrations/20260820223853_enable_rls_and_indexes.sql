-- Enable RLS on tables
alter table teams enable row level security;
alter table seekers enable row level security;
alter table join_requests enable row level security;

-- Teams Policies
create policy "Enable read access for all users" on teams for select using (true);
create policy "Enable insert for authenticated users" on teams for insert with check (auth.uid() = user_id);
create policy "Enable update for team leaders" on teams for update using (auth.uid() = user_id);
create policy "Enable delete for team leaders" on teams for delete using (auth.uid() = user_id);

-- Seekers Policies
create policy "Enable read access for all users" on seekers for select using (true);
create policy "Enable insert for authenticated users" on seekers for insert with check (auth.uid() = user_id);
create policy "Enable update for own profile" on seekers for update using (auth.uid() = user_id);
create policy "Enable delete for own profile" on seekers for delete using (auth.uid() = user_id);

-- Join Requests Policies
create policy "Enable read access for involved users" on join_requests for select using (true);
create policy "Enable insert for authenticated users" on join_requests for insert with check (auth.uid() = user_id);
create policy "Enable update for team leaders" on join_requests for update using (
  auth.uid() in (select user_id from teams where id = join_requests.team_id)
);
create policy "Enable delete for team leaders or requesters" on join_requests for delete using (
  auth.uid() = user_id or auth.uid() in (select user_id from teams where id = join_requests.team_id)
);

-- Fix Unindexed Foreign Keys
create index if not exists join_requests_team_id_idx on join_requests(team_id);
create index if not exists join_requests_user_id_idx on join_requests(user_id);
create index if not exists join_requests_seeker_id_idx on join_requests(seeker_id);
create index if not exists teams_user_id_idx on teams(user_id);
create index if not exists seekers_user_id_idx on seekers(user_id);

