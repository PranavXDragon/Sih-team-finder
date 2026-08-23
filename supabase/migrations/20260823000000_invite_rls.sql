-- Allow team leaders to invite seekers
-- The team leader must be inserting a row for their own team, and the status must be 'invited'
create policy "Enable insert for team leaders inviting" on join_requests for insert with check (
  auth.uid() in (select user_id from teams where id = join_requests.team_id)
  and status = 'invited'
);
