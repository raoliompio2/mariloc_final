-- View para mostrar usuários admin
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    au.user_id,
    p.email,
    p.full_name,
    au.created_at as admin_since
FROM admin_users au
JOIN auth.users p ON p.id = au.user_id;

-- View para auditoria de máquinas
CREATE OR REPLACE VIEW machines_audit_view AS
SELECT 
    m.id as machine_id,
    m.name as machine_name,
    m.created_at,
    m.updated_at,
    p.email as last_modified_by,
    CASE 
        WHEN au.user_id IS NOT NULL THEN 'Admin'
        ELSE 'Regular User'
    END as user_role
FROM machines m
LEFT JOIN auth.users p ON p.id = auth.uid()
LEFT JOIN admin_users au ON au.user_id = p.id
ORDER BY m.updated_at DESC;

-- View para auditoria de dados técnicos
CREATE OR REPLACE VIEW technical_data_audit_view AS
SELECT 
    td.machine_id,
    m.name as machine_name,
    td.label,
    td.value,
    td.is_highlight,
    td.created_at,
    p.email as created_by,
    CASE 
        WHEN au.user_id IS NOT NULL THEN 'Admin'
        ELSE 'Regular User'
    END as user_role
FROM technical_data td
JOIN machines m ON m.id = td.machine_id
LEFT JOIN auth.users p ON p.id = auth.uid()
LEFT JOIN admin_users au ON au.user_id = p.id
ORDER BY td.created_at DESC;

-- Função para listar todas as alterações recentes
CREATE OR REPLACE FUNCTION get_recent_changes(
    days_ago integer DEFAULT 7
)
RETURNS TABLE (
    entity_type text,
    entity_id uuid,
    entity_name text,
    action_type text,
    modified_at timestamp with time zone,
    modified_by text,
    user_role text
) AS $$
BEGIN
    RETURN QUERY
    -- Alterações em máquinas
    SELECT 
        'Machine'::text as entity_type,
        m.id as entity_id,
        m.name as entity_name,
        CASE 
            WHEN m.created_at = m.updated_at THEN 'Created'
            ELSE 'Updated'
        END as action_type,
        m.updated_at as modified_at,
        p.email as modified_by,
        CASE 
            WHEN au.user_id IS NOT NULL THEN 'Admin'
            ELSE 'Regular User'
        END as user_role
    FROM machines m
    LEFT JOIN auth.users p ON p.id = auth.uid()
    LEFT JOIN admin_users au ON au.user_id = p.id
    WHERE m.updated_at >= NOW() - (days_ago || ' days')::interval
    
    UNION ALL
    
    -- Alterações em dados técnicos
    SELECT 
        'Technical Data'::text as entity_type,
        td.machine_id as entity_id,
        m.name as entity_name,
        'Created'::text as action_type,
        td.created_at as modified_at,
        p.email as modified_by,
        CASE 
            WHEN au.user_id IS NOT NULL THEN 'Admin'
            ELSE 'Regular User'
        END as user_role
    FROM technical_data td
    JOIN machines m ON m.id = td.machine_id
    LEFT JOIN auth.users p ON p.id = auth.uid()
    LEFT JOIN admin_users au ON au.user_id = p.id
    WHERE td.created_at >= NOW() - (days_ago || ' days')::interval
    
    ORDER BY modified_at DESC;
END;
$$ LANGUAGE plpgsql;
