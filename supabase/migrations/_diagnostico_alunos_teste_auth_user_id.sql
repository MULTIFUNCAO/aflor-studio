-- DIAGNÓSTICO — só leitura, nada é alterado.
-- Lista nome/email/auth_user_id dos alunos de teste em curso_alunos, pra
-- investigar por que o vínculo do ZZZ TESTE ALUNO não gravou (hipótese:
-- outro aluno de teste já usa o mesmo auth_user_id, batendo no índice
-- único curso_alunos_auth_user_id_key).

SELECT nome, COALESCE(email,'<vazio>') AS email, COALESCE(auth_user_id::text,'<null>') AS auth_user_id, salao_id
FROM curso_alunos
WHERE nome ILIKE '%teste%' OR nome ILIKE '%ZZZ%'
ORDER BY nome;
