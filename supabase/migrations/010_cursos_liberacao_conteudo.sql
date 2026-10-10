-- Módulo "Gestão de Cursos" — Fase 2 (Prioridade 2): liberação programada de
-- conteúdo (curso híbrido / "Programar a liberação de conteúdos").
-- 100% aditivo: 2 colunas nullable, sem default, sem afetar nenhuma linha
-- existente. Sem RLS nova — a visibilidade por matrícula já é garantida pelas
-- policies "..._select_aluno" de 005_cursos_schema.sql; liberar_em é só um
-- campo de data que o front (admin grava, portal do aluno filtra) usa pra
-- decidir se mostra o item já ou ainda não. Rodar no Supabase SQL Editor.

ALTER TABLE curso_aulas ADD COLUMN IF NOT EXISTS liberar_em date;
ALTER TABLE curso_materiais ADD COLUMN IF NOT EXISTS liberar_em date;

NOTIFY pgrst, 'reload schema';

-- Verificação
SELECT column_name FROM information_schema.columns
WHERE table_name IN ('curso_aulas','curso_materiais') AND column_name='liberar_em';
