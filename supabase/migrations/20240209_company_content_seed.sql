-- Inserir dados iniciais na tabela company_hero
insert into company_hero (title, subtitle, poster_url) values 
('Bolt Rental', 'Soluções completas em locação de equipamentos', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd');

-- Inserir dados iniciais na tabela company_mission_vision_values
insert into company_mission_vision_values (type, title, description, icon) values
('mission', 'Nossa Missão', 'Fornecer soluções de locação de equipamentos com excelência, segurança e eficiência', 'Target'),
('vision', 'Nossa Visão', 'Ser referência nacional em locação de equipamentos até 2025', 'Eye'),
('values', 'Nossos Valores', 'Comprometimento, Inovação, Segurança e Sustentabilidade', 'Heart');

-- Inserir dados iniciais na tabela company_timeline
insert into company_timeline (year, title, description) values
('2020', 'Fundação', 'Início das operações em São Paulo'),
('2021', 'Expansão', 'Abertura da primeira filial no Rio de Janeiro'),
('2022', 'Crescimento', 'Ampliação da frota e novos serviços'),
('2023', 'Inovação', 'Lançamento da plataforma digital');

-- Inserir dados iniciais na tabela company_values
insert into company_values (title, description, image_url, icon) values
('Segurança', 'Priorizamos a segurança em todas as operações', 'https://images.unsplash.com/photo-1531973576160-7125cd663d86', 'Shield'),
('Inovação', 'Buscamos constantemente novas soluções', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa', 'Lightbulb'),
('Qualidade', 'Excelência em todos os serviços', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40', 'Award');

-- Inserir dados iniciais na tabela company_sectors
insert into company_sectors (title, image_url) values
('Construção Civil', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5'),
('Indústria', 'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1'),
('Mineração', 'https://images.unsplash.com/photo-1579551054172-f6942ee2e5a8');

-- Inserir dados iniciais na tabela company_certifications
insert into company_certifications (name, image_url) values
('ISO 9001', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f'),
('ISO 14001', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f'),
('OHSAS 18001', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f');
