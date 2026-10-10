-- DIAGNÓSTICO — só leitura, nada é alterado. Rodar no Supabase SQL Editor.
-- Tudo unificado numa única tabela (bloco, objeto, detalhe) porque o SQL Editor
-- só mostra o resultado da última consulta quando rodam várias de uma vez.
-- Edge Functions NÃO aparecem aqui de propósito — elas não se autenticam como
-- roles do Postgres (cursos_migrator/postgres), só com as chaves da API
-- (anon/service_role), então não há como esse papel estar "em uso" por uma
-- Edge Function no sentido de ownership de banco.

SELECT '1_role_attrs' AS bloco, rolname::text AS objeto,
  format('super=%s createrole=%s createdb=%s canlogin=%s replication=%s bypassrls=%s',
         rolsuper, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication, rolbypassrls) AS detalhe
FROM pg_roles WHERE rolname IN ('cursos_migrator','postgres')

UNION ALL

SELECT '2_membership', r.rolname::text, format('membro_de=%s admin_option=%s', g.rolname, m.admin_option)
FROM pg_auth_members m
JOIN pg_roles r ON r.oid = m.member
JOIN pg_roles g ON g.oid = m.roleid
WHERE g.rolname = 'cursos_migrator'

UNION ALL

SELECT '3_objetos_dono', (n.nspname || '.' || c.relname)::text,
  (CASE c.relkind WHEN 'r' THEN 'tabela' WHEN 'v' THEN 'view' WHEN 'm' THEN 'matview' WHEN 'S' THEN 'sequence' ELSE c.relkind::text END)::text
FROM pg_class c
JOIN pg_roles o ON o.oid = c.relowner
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE o.rolname = 'cursos_migrator'

UNION ALL

SELECT '4_funcoes_dono', (n.nspname || '.' || p.proname)::text, pg_get_function_identity_arguments(p.oid)::text
FROM pg_proc p
JOIN pg_roles o ON o.oid = p.proowner
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE o.rolname = 'cursos_migrator'

UNION ALL

SELECT '5_policies', (pol.schemaname || '.' || pol.tablename || '.' || pol.policyname)::text, pol.cmd::text
FROM pg_policies pol
JOIN pg_class c ON c.relname = pol.tablename
JOIN pg_namespace n2 ON n2.oid = c.relnamespace AND n2.nspname = pol.schemaname
JOIN pg_roles o ON o.oid = c.relowner
WHERE o.rolname = 'cursos_migrator'

UNION ALL

SELECT '6_triggers', (n.nspname || '.' || c.relname)::text, t.tgname::text
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_roles o ON o.oid = c.relowner
WHERE o.rolname = 'cursos_migrator' AND NOT t.tgisinternal

ORDER BY bloco, objeto;
