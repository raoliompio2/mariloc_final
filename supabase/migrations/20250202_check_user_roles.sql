-- Verificar todos os tipos de usuários únicos
SELECT DISTINCT 
    raw_user_meta_data->>'role' as role,
    COUNT(*) as total_users
FROM auth.users
GROUP BY raw_user_meta_data->>'role'
ORDER BY role;

-- Ver detalhes de todos os usuários
SELECT 
    id,
    email,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data
FROM auth.users
ORDER BY email;
