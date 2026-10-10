-- Reaplicação das migrations 010 (liberação programada de conteúdo) e 011
-- (CHECK de tipo_evento ampliado) — as duas tinham "rodado sem erro visível"
-- mas não pegaram, pelo mesmo motivo da 008: curso_aulas, curso_materiais e
-- curso_notificacoes eram de cursos_migrator, e a sessão do SQL Editor roda
-- como postgres, que não tinha privilégio de ALTER nessas tabelas. Agora que
-- a ownership das 21 tabelas foi transferida pra postgres (008b), os ALTER
-- abaixo rodam direto, sem precisar de GRANT/SET ROLE.

-- ===== 010 — liberação programada de conteúdo =====

ALTER TABLE curso_aulas ADD COLUMN IF NOT EXISTS liberar_em date;
ALTER TABLE curso_materiais ADD COLUMN IF NOT EXISTS liberar_em date;

-- ===== 011 — amplia CHECK de tipo_evento (comunicado/live_evento/alteracao_horario) =====

DO $$
DECLARE conname text;
BEGIN
  SELECT con.conname INTO conname
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'curso_notificacoes' AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%tipo_evento%';
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE curso_notificacoes DROP CONSTRAINT %I', conname);
  END IF;
END $$;

ALTER TABLE curso_notificacoes ADD CONSTRAINT curso_notificacoes_tipo_evento_check
  CHECK (tipo_evento IN (
    'aula_amanha','nova_apostila','exercicio_corrigido','aprovado_prova','certificado_disponivel',
    'comunicado','live_evento','alteracao_horario'
  ));

NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- Verificação (última consulta, uma tabela só)
-- =====================================================================

SELECT '010_liberar_em' AS bloco, (table_name || '.' || column_name)::text AS objeto,
  ('tipo=' || data_type || ', nullable=' || is_nullable)::text AS detalhe
FROM information_schema.columns
WHERE table_name IN ('curso_aulas','curso_materiais') AND column_name = 'liberar_em'

UNION ALL

SELECT '011_tipo_evento_check', con.conname::text,
  (CASE WHEN pg_get_constraintdef(con.oid) LIKE '%comunicado%'
     THEN 'contem_comunicado=SIM | ' ELSE 'contem_comunicado=NAO | ' END
   || pg_get_constraintdef(con.oid))::text
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'curso_notificacoes' AND con.contype = 'c'
  AND pg_get_constraintdef(con.oid) LIKE '%tipo_evento%'

ORDER BY bloco, objeto;
