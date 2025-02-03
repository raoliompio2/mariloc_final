-- Verificar dono da máquina
SELECT 
    m.id as machine_id,
    m.name as machine_name,
    m.owner_id,
    auth.uid() as current_user_id,
    m.owner_id = auth.uid() as is_owner
FROM machines m 
WHERE m.id = '091ae7af-2f56-4eca-9c44-d9c3f47624e8';
