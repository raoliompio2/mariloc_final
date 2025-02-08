-- Create subcategories table
create table if not exists public.subcategories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.subcategories enable row level security;

-- Create policies
create policy "Enable read access for all users"
  on public.subcategories for select
  using (true);

create policy "Enable insert for authenticated users"
  on public.subcategories for insert
  with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users"
  on public.subcategories for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users"
  on public.subcategories for delete
  using (auth.role() = 'authenticated');

-- Create indexes
create index if not exists subcategories_name_idx on public.subcategories (name);
