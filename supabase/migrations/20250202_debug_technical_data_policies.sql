-- Verificar políticas de technical_data
SELECT * FROM debug_policy_check('091ae7af-2f56-4eca-9c44-d9c3f47624e8');

-- Verificar todas as políticas ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'technical_data'
ORDER BY policyname;
