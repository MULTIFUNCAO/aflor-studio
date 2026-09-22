-- Correção: a migration 005 criou RLS completa nas 21 tabelas do módulo de Cursos,
-- mas esqueceu de conceder GRANT de tabela para "authenticated" — RLS e GRANT são
-- camadas independentes no Postgres (GRANT decide SE a role pode tentar a operação;
-- RLS decide QUAIS linhas ela enxerga dentro disso). Sem o GRANT, toda chamada real
-- do app (que roda como "authenticated" via PostgREST) falhava com
-- "permission denied for table X" (42501), mesmo a RLS estando correta.
-- Descoberto testando o Fase 2 CRUD ao vivo no navegador, não só lendo o SQL.
-- Rodar no Supabase SQL Editor.

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'cursos','curso_modulos','curso_aulas','curso_materiais','curso_exercicios',
    'curso_provas','curso_prova_perguntas','curso_combos','curso_combo_itens',
    'curso_turmas','curso_turma_aulas','curso_alunos','curso_matriculas',
    'curso_matricula_status_historico','curso_matricula_parcelas','curso_presencas',
    'curso_progresso_conteudo','curso_exercicio_envios','curso_prova_tentativas',
    'curso_certificados','curso_notificacoes'
  ])
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated', t);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

-- Verificação
SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privilegios
FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee='authenticated' AND (table_name LIKE 'curso%' OR table_name='cursos')
GROUP BY table_name, grantee
ORDER BY table_name;
