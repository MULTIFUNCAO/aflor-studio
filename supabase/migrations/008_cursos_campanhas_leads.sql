-- Módulo "Gestão de Cursos" — Fase 1 (Prioridade 1): Campanhas e Leads comerciais.
-- 100% aditivo: cria 2 tabelas novas (curso_campanhas, curso_leads) + 1 tabela de
-- histórico (curso_lead_historico) + 2 colunas novas opcionais em curso_matriculas
-- (rastreio de origem). Nenhuma tabela existente é alterada em comportamento.
--
-- Convenções replicadas de 005_cursos_schema.sql / 006_cursos_grants.sql:
--   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   - salao_id text NOT NULL
--   - SEM foreign key constraints (convenção do projeto inteiro)
--   - RLS: policy "<tabela>_admin_all" por salao_id::text = my_salao_id()
--   - GRANT explícito pra authenticated (lição da 006 — RLS sem GRANT = 42501)
--   - Rodar no Supabase SQL Editor, projeto "Flora Gestão".
--
-- Decisão confirmada com a usuária em 2026-10-09: curso_matriculas tem hoje só 1
-- linha (status 'matriculado'), nenhuma em 'interessado'/'ficha_enviada' — não há
-- dado real pra migrar. O CHECK de curso_matriculas.status NÃO é alterado aqui
-- (continua aceitando esses valores por compatibilidade), mas o código novo do
-- front para de gravar esses dois valores: pré-venda agora vive em curso_leads.

-- =====================================================================
-- 1. CAMPANHAS (anúncios de cursos/combos — cadastro manual, sem importação
--    automática de plataforma de anúncios ainda; estrutura pensada pra ser
--    extensível depois com uma coluna "fonte" se uma integração real aparecer)
-- =====================================================================

CREATE TABLE IF NOT EXISTS curso_campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  nome text NOT NULL,
  curso_id uuid,
  combo_id uuid,
  criativo_desc text,       -- descrição do criativo usado (ex: "Carrossel 5 fotos turma julho")
  criativo_url text,        -- link do criativo (Drive, anúncio, etc.), quando houver
  canal text,                -- texto livre: Instagram, Facebook, Google, Indicação, Orgânico...
  data_inicio date,
  data_fim date,
  data_prevista_curso date, -- quando o curso anunciado deve de fato acontecer
  valor_anunciado numeric,
  orcamento numeric,
  link_externo text,
  status text NOT NULL DEFAULT 'ativa' CHECK (status IN ('planejada','ativa','pausada','encerrada')),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT curso_campanhas_curso_combo_nao_ambos CHECK (
    NOT (curso_id IS NOT NULL AND combo_id IS NOT NULL)
  )
);

-- =====================================================================
-- 2. LEADS (CRM comercial pré-venda — separado de curso_matriculas, que
--    passa a representar só venda confirmada)
-- =====================================================================

CREATE TABLE IF NOT EXISTS curso_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  nome text NOT NULL,
  telefone text,
  whatsapp text,
  email text,
  curso_id uuid,
  combo_id uuid,
  campanha_id uuid,
  etapa text NOT NULL DEFAULT 'novo' CHECK (etapa IN (
    'novo','atendimento','interessado','aguardando_retorno',
    'aguardando_pagamento','matriculado','nao_fechou','perdido'
  )),
  responsavel_id uuid,       -- colaboradores.id (mesmo padrão "solto" de curso_turmas.professor_id)
  periodo_preferencia text,  -- texto livre: manhã/tarde/noite/fds, etc.
  observacoes text,
  data_entrada date NOT NULL DEFAULT CURRENT_DATE,
  data_retorno date,
  motivo_perda text,
  matricula_id uuid,         -- preenchido na conversão lead -> matrícula (evita duplicar)
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT curso_leads_curso_combo_nao_ambos CHECK (
    NOT (curso_id IS NOT NULL AND combo_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS curso_lead_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  salao_id text NOT NULL,
  etapa_anterior text,
  etapa_nova text NOT NULL,
  observacao text,
  registrado_por text,       -- mesmo padrão de curso_matricula_status_historico.alterado_por
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- 3. Rastreio de origem na matrícula (aditivo, nullable — não afeta a
--    única linha existente nem o fluxo atual de criação de matrícula)
-- =====================================================================

ALTER TABLE curso_matriculas ADD COLUMN IF NOT EXISTS lead_id uuid;
ALTER TABLE curso_matriculas ADD COLUMN IF NOT EXISTS campanha_id uuid;

-- =====================================================================
-- 4. ÍNDICES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_curso_campanhas_salao ON curso_campanhas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_campanhas_curso ON curso_campanhas (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_campanhas_combo ON curso_campanhas (combo_id);

CREATE INDEX IF NOT EXISTS idx_curso_leads_salao ON curso_leads (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_leads_curso ON curso_leads (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_leads_combo ON curso_leads (combo_id);
CREATE INDEX IF NOT EXISTS idx_curso_leads_campanha ON curso_leads (campanha_id);
CREATE INDEX IF NOT EXISTS idx_curso_leads_etapa ON curso_leads (etapa);
CREATE INDEX IF NOT EXISTS idx_curso_leads_responsavel ON curso_leads (responsavel_id);

CREATE INDEX IF NOT EXISTS idx_curso_lead_historico_salao ON curso_lead_historico (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_lead_historico_lead ON curso_lead_historico (lead_id);

CREATE INDEX IF NOT EXISTS idx_curso_matriculas_lead ON curso_matriculas (lead_id);
CREATE INDEX IF NOT EXISTS idx_curso_matriculas_campanha ON curso_matriculas (campanha_id);

-- =====================================================================
-- 5. RLS + GRANT (idêntico ao padrão admin de 005/006 — só dono/colaborador
--    do salão acessa; aluno nunca precisa dessas 3 tabelas)
-- =====================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['curso_campanhas','curso_leads','curso_lead_historico'])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_admin_all" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_admin_all" ON %I FOR ALL TO authenticated USING (salao_id::text = my_salao_id()) WITH CHECK (salao_id::text = my_salao_id())',
      t, t
    );
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated', t);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- Verificação
-- =====================================================================

SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name IN ('curso_campanhas','curso_leads','curso_lead_historico')
ORDER BY table_name;

SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('curso_campanhas','curso_leads','curso_lead_historico');

SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('curso_campanhas','curso_leads','curso_lead_historico');

SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privilegios
FROM information_schema.role_table_grants
WHERE table_schema='public' AND grantee='authenticated'
  AND table_name IN ('curso_campanhas','curso_leads','curso_lead_historico')
GROUP BY table_name, grantee ORDER BY table_name;

SELECT column_name FROM information_schema.columns
WHERE table_name='curso_matriculas' AND column_name IN ('lead_id','campanha_id');
