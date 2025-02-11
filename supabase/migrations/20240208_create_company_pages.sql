-- Create company_info table
CREATE TABLE company_info (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    meta_description text,
    banner_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create contact_info table
CREATE TABLE contact_info (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    type text NOT NULL, -- 'phone', 'email', 'whatsapp', 'address'
    value text NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create faqs table for SAC
CREATE TABLE faqs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    question text NOT NULL,
    answer text NOT NULL,
    category text NOT NULL, -- 'rental', 'payment', 'return', 'maintenance'
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create support_tickets table for SAC
CREATE TABLE support_tickets (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id uuid REFERENCES profiles(id) NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed'
    priority text NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    related_rental_id uuid REFERENCES rentals(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create support_messages table for ticket conversations
CREATE TABLE support_messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id uuid REFERENCES support_tickets(id) NOT NULL,
    sender_id uuid REFERENCES profiles(id) NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Company info policies
CREATE POLICY "Allow public read access to company_info" ON company_info
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow admin update company_info" ON company_info
    FOR UPDATE TO authenticated USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- Contact info policies
CREATE POLICY "Allow public read access to contact_info" ON contact_info
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow admin update contact_info" ON contact_info
    FOR UPDATE TO authenticated USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- FAQs policies
CREATE POLICY "Allow public read access to faqs" ON faqs
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Allow admin manage faqs" ON faqs
    FOR ALL TO authenticated USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- Support tickets policies
CREATE POLICY "Allow clients to create and view their own tickets" ON support_tickets
    FOR ALL TO authenticated USING (
        client_id = auth.uid() OR
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'support')
    );

-- Support messages policies
CREATE POLICY "Allow ticket participants to view and create messages" ON support_messages
    FOR ALL TO authenticated USING (
        sender_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM support_tickets st
            WHERE st.id = ticket_id AND (
                st.client_id = auth.uid() OR
                (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'support')
            )
        )
    );

-- Insert initial company info
INSERT INTO company_info (title, content, meta_description) VALUES
('Sobre Nossa Empresa', 
'Somos uma plataforma líder em aluguel de máquinas, conectando proprietários e clientes de forma eficiente e segura. Nossa missão é facilitar o acesso a equipamentos de qualidade, promovendo o crescimento sustentável do setor.', 
'Plataforma líder em aluguel de máquinas. Conectamos proprietários e clientes, oferecendo soluções eficientes para suas necessidades de equipamentos.');

-- Insert initial contact info
INSERT INTO contact_info (type, value, is_primary) VALUES
('phone', '+55 11 1234-5678', true),
('email', 'contato@suaempresa.com', true),
('whatsapp', '+55 11 98765-4321', true),
('address', 'Av. Principal, 1000 - São Paulo, SP', true);

-- Insert initial FAQs
INSERT INTO faqs (question, answer, category, order_index) VALUES
('Como funciona o processo de aluguel?', 'O processo é simples: escolha a máquina desejada, solicite um orçamento, aguarde a aprovação do proprietário e confirme o aluguel após acordo.', 'rental', 1),
('Quais são as formas de pagamento aceitas?', 'Aceitamos transferência bancária, PIX e cartão de crédito. O pagamento deve ser realizado após a aprovação do orçamento.', 'payment', 1),
('Como funciona a devolução do equipamento?', 'A devolução deve ser agendada através da plataforma. O equipamento será inspecionado e, se estiver nas condições acordadas, a devolução será confirmada.', 'return', 1),
('Qual a política de manutenção?', 'A manutenção preventiva é responsabilidade do proprietário. Em caso de problemas durante o uso, entre em contato imediatamente através da plataforma.', 'maintenance', 1);
