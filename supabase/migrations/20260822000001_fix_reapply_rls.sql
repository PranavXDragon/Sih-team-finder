-- Allow seekers to update their own join_requests to re-apply
-- The `with check (status = 'pending')` ensures they cannot maliciously set their status to 'accepted'
create policy "Enable update for requesters to reapply" on join_requests for update using (auth.uid() = user_id) with check (status = 'pending');
