-- Verificar políticas atuais
SELECT schemaname, 
       tablename, 
       policyname, 
       permissive, 
       roles, 
       cmd, 
       qual, 
       with_check
FROM pg_policies 
WHERE schemaname = 'public' 
   OR schemaname = 'storage'
ORDER BY schemaname, tablename, cmd;
