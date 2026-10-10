-- Módulo "Gestão de Cursos" — Fase 3 (Prioridade 3, frente 1): Notificações.
-- curso_notificacoes já existe (migration 005), mas o CHECK de tipo_evento só
-- previa eventos automáticos que ainda não existem (ex: exercicio_corrigido,
-- disparado quando eu construir a frente de Atividades). O comunicado manual
-- do admin (a única fonte de notificação que existe hoje, já que não há
-- integração de WhatsApp/e-mail) precisa de categorias próprias: aviso geral,
-- live/evento agendado e alteração de horário.
-- 100% aditivo: só AMPLIA o CHECK (nenhum valor existente é removido), não
-- altera linhas, não mexe em RLS (a policy admin_all e as policies de aluno
-- de 005 continuam valendo). Rodar no Supabase SQL Editor.

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

-- Verificação
SELECT pg_get_constraintdef(con.oid) AS definicao
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'curso_notificacoes' AND con.contype = 'c'
  AND pg_get_constraintdef(con.oid) LIKE '%tipo_evento%';
