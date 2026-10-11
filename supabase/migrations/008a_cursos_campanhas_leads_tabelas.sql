-- Módulo "Gestão de Cursos" — Fase 1 (Prioridade 1): Campanhas e Leads comerciais.
-- Parte A: SÓ as 3 tabelas novas (curso_campanhas, curso_leads, curso_lead_historico).
-- Não toca em nenhuma tabela pré-existente — por isso não esbarra no problema de
-- ownership do cursos_migrator (essas 3 tabelas são criadas agora, pela role que
-- rodar este script no SQL Editor, então essa role já nasce dona delas).
-- A parte B (colunas lead_id/campanha_id em curso_matriculas) é um arquivo
-- separado de propósito, porque aquela tabela tem dono diferente.
-- Rodar no Supabase SQL Editor, projeto "Flora Gestão".

CREATE TABLE IF NOT EXISTS curso_campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  nome text NOT NULL,
  curso_id uuid,
  combo_id uuid,
  criativo_desc text,
  criativo_url text,
  canal text,
  data_inicio date,
  data_fim date,
  data_prevista_curso date,
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
  responsavel_id uuid,
  periodo_preferencia text,
  observacoes text,
  data_entrada date NOT NULL DEFAULT CURRENT_DATE,
  data_retorno date,
  motivo_perda text,
  matricula_id uuid,
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
  registrado_por text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

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
-- Verificação (última consulta)
-- =====================================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name IN ('curso_campanhas','curso_leads','curso_lead_historico')
ORDER BY table_name;
