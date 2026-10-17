-- 017: suporte a regras_avaliacao (quiz por módulo + prova final) vindas do
-- primeiro curso real importado (Cabeleireiro). 100% aditivo:
--   - só ADD COLUMN em curso_provas e curso_prova_perguntas (novas colunas com
--     DEFAULT, não quebra nenhuma linha existente)
--   - só ADD COLUMN em cursos (2 flags novas de sequenciamento)
--   - 1 DROP NOT NULL em curso_provas.tentativas_maximas (NULL passa a
--     significar "tentativas ilimitadas")
-- Nenhuma tabela nova, nenhuma policy de RLS nova (não muda o shape de linha
-- que as policies existentes já filtram por salao_id).

-- =====================================================================
-- 1. curso_provas — configuração por prova (quiz de módulo OU prova final,
--    diferenciados pelo modulo_id já existente: preenchido = quiz do módulo,
--    NULL = prova final do curso)
-- =====================================================================

ALTER TABLE curso_provas
  ALTER COLUMN tentativas_maximas DROP NOT NULL;
COMMENT ON COLUMN curso_provas.tentativas_maximas IS 'NULL = tentativas ilimitadas (ex.: quiz de módulo)';

ALTER TABLE curso_provas
  ADD COLUMN IF NOT EXISTS embaralhar_perguntas boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS embaralhar_opcoes boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mostrar_explicacao_apos_responder boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS mostrar_gabarito text NOT NULL DEFAULT 'sempre'
    CHECK (mostrar_gabarito IN ('sempre', 'apos_aprovar_ou_esgotar', 'nunca'));

-- =====================================================================
-- 2. curso_prova_perguntas — explicação por pergunta (mostrada após
--    responder, controlado pela flag acima)
-- =====================================================================

ALTER TABLE curso_prova_perguntas
  ADD COLUMN IF NOT EXISTS explicacao text;

-- =====================================================================
-- 3. cursos — regras de sequenciamento do curso (regras_avaliacao do JSON
--    são por curso, não por módulo, então as flags ficam aqui)
-- =====================================================================

ALTER TABLE cursos
  ADD COLUMN IF NOT EXISTS quiz_modulo_bloqueia_proximo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prova_final_exige_quizzes_aprovados boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN cursos.quiz_modulo_bloqueia_proximo IS 'Se true, o aluno só vê o próximo módulo liberado depois de aprovar o quiz do módulo atual (curso_provas com modulo_id preenchido)';
COMMENT ON COLUMN cursos.prova_final_exige_quizzes_aprovados IS 'Se true, a prova final (curso_provas com modulo_id NULL) só pode ser iniciada depois que todos os quizzes de módulo do curso estiverem aprovados';

-- =====================================================================
-- 4. Verificação (ÚLTIMA consulta — é a única que o SQL Editor mostra)
-- =====================================================================

SELECT 'curso_provas' AS tabela, column_name AS coluna, data_type AS tipo, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'curso_provas'
  AND column_name IN ('tentativas_maximas','embaralhar_perguntas','embaralhar_opcoes','mostrar_explicacao_apos_responder','mostrar_gabarito')
UNION ALL
SELECT 'curso_prova_perguntas', column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'curso_prova_perguntas' AND column_name = 'explicacao'
UNION ALL
SELECT 'cursos', column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cursos' AND column_name IN ('quiz_modulo_bloqueia_proximo','prova_final_exige_quizzes_aprovados')
ORDER BY tabela, coluna;
