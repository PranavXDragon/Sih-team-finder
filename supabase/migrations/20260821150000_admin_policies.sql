-- Add Admin policies to Teams, Seekers, and Join Requests
-- Any user with the email "admin@sih2026.com" gets full bypass (update, delete) on these tables.

-- Teams Admin Policies
create policy "Enable admin update on teams" on teams for update using (auth.jwt() ->> 'email' = 'admin@sih2026.com');
create policy "Enable admin delete on teams" on teams for delete using (auth.jwt() ->> 'email' = 'admin@sih2026.com');

-- Seekers Admin Policies
create policy "Enable admin update on seekers" on seekers for update using (auth.jwt() ->> 'email' = 'admin@sih2026.com');
create policy "Enable admin delete on seekers" on seekers for delete using (auth.jwt() ->> 'email' = 'admin@sih2026.com');

-- Join Requests Admin Policies
create policy "Enable admin update on join_requests" on join_requests for update using (auth.jwt() ->> 'email' = 'admin@sih2026.com');
create policy "Enable admin delete on join_requests" on join_requests for delete using (auth.jwt() ->> 'email' = 'admin@sih2026.com');
