-- Create GPT usage tracking table
create table if not exists gpt_usage (
  id uuid default uuid_generate_v4() primary key,
  tokens integer not null,
  cost numeric(10,6) not null,
  model text not null,
  purpose text not null,
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Add RLS policies
alter table gpt_usage enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Authenticated users can read gpt usage" on gpt_usage;
drop policy if exists "Authenticated users can insert gpt usage" on gpt_usage;

-- Allow read access to authenticated users
create policy "Authenticated users can read gpt usage"
  on gpt_usage for select
  to authenticated
  using (true);

-- Allow insert access to authenticated users
create policy "Authenticated users can insert gpt usage"
  on gpt_usage for insert
  to authenticated
  with check (true);

-- Create index on timestamp for better query performance
create index if not exists gpt_usage_timestamp_idx on gpt_usage (timestamp);

-- Create index on model for analytics
create index if not exists gpt_usage_model_idx on gpt_usage (model);
