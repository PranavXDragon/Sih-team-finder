-- Teams Table
create table teams (
  id uuid default gen_random_uuid() primary key,
  "teamName" text not null,
  pitch text,
  college text,
  track text,
  theme text,
  "needsFemale" boolean default false,
  "psId" text,
  "wantsSkills" text[] default '{}',
  contact text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seekers Table
create table seekers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  college text,
  bio text,
  skills text[] default '{}',
  whatsapp text,
  listed boolean default true,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);
