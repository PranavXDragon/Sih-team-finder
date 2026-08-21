-- Enable Realtime for teams, seekers, and join_requests tables
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table seekers;
alter publication supabase_realtime add table join_requests;
