-- DIAGNÓSTICO — só leitura, nada é alterado, nenhum e-mail é reenviado.
-- Confere o e-mail salvo em curso_alunos pro ZZZ TESTE ALUNO e se já existe
-- um usuário com esse e-mail em auth.users (causa do AuthApiError
-- "already been registered" ao clicar em Criar Acesso).

SELECT 'curso_alunos' AS bloco, nome AS objeto,
  ('email=' || COALESCE(email,'<vazio>')
   || ' | tel=' || COALESCE(tel,'<vazio>')
   || ' | auth_user_id=' || COALESCE(auth_user_id::text,'<null>')
   || ' | salao_id=' || salao_id)::text AS detalhe
FROM curso_alunos
WHERE nome ILIKE '%ZZZ TESTE ALUNO%'

UNION ALL

SELECT 'auth.users', COALESCE(email,'<sem email>')::text,
  ('id=' || id::text
   || ' | criado_em=' || created_at::text
   || ' | confirmado_em=' || COALESCE(email_confirmed_at::text,'<nao confirmado>'))::text
FROM auth.users
WHERE email = (SELECT email FROM curso_alunos WHERE nome ILIKE '%ZZZ TESTE ALUNO%' LIMIT 1)

ORDER BY bloco;
