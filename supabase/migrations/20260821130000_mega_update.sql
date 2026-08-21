-- Remove hasMentor column
ALTER TABLE teams DROP COLUMN IF EXISTS "hasMentor";

-- Ensure a user can only CREATE one team
ALTER TABLE teams ADD CONSTRAINT unique_team_leader UNIQUE (user_id);

-- Ensure a user can only be ACCEPTED into one team
CREATE UNIQUE INDEX IF NOT EXISTS unique_accepted_member ON join_requests (user_id) WHERE status = 'accepted';
