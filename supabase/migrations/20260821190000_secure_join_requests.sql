-- Drop the overly permissive select policy
drop policy if exists "Enable read access for involved users" on join_requests;

-- Create the secure select policy
create policy "Enable read access for involved users" on join_requests for select using (
  auth.uid() = user_id or auth.uid() in (select user_id from teams where id = join_requests.team_id)
);
