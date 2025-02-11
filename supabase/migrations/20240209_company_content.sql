-- Tabela para Missão, Visão e Valores
create table if not exists company_mission_vision_values (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('mission', 'vision', 'values')),
  title text not null,
  description text not null,
  icon text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para Timeline da Empresa
create table if not exists company_timeline (
  id uuid primary key default uuid_generate_v4(),
  year text not null,
  title text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para Valores Detalhados
create table if not exists company_values (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  image_url text not null,
  icon text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para Setores de Atuação
create table if not exists company_sectors (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para Certificações
create table if not exists company_certifications (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para Conteúdo Hero
create table if not exists company_hero (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text not null,
  video_url text,
  poster_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Função para atualizar o updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers para atualizar updated_at
create trigger update_company_mission_vision_values_updated_at
  before update on company_mission_vision_values
  for each row execute function update_updated_at_column();

create trigger update_company_timeline_updated_at
  before update on company_timeline
  for each row execute function update_updated_at_column();

create trigger update_company_values_updated_at
  before update on company_values
  for each row execute function update_updated_at_column();

create trigger update_company_sectors_updated_at
  before update on company_sectors
  for each row execute function update_updated_at_column();

create trigger update_company_certifications_updated_at
  before update on company_certifications
  for each row execute function update_updated_at_column();

create trigger update_company_hero_updated_at
  before update on company_hero
  for each row execute function update_updated_at_column();
