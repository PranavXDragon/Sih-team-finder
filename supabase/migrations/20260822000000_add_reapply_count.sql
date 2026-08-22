-- Add reapply_count to join_requests to limit spam
ALTER TABLE join_requests ADD COLUMN IF NOT EXISTS reapply_count integer DEFAULT 0 NOT NULL;
