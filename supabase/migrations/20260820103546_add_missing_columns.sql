-- Add missing columns to teams table
alter table teams
add column "hasIdea" boolean default false,
add column "psTitle" text,
add column "hasMentor" boolean default false,
add column "seatsOpen" integer,
add column "totalSeats" integer,
add column "members" jsonb;

-- Add missing columns to seekers table
alter table seekers
add column "dept" text,
add column "year" text,
add column "gender" text;
