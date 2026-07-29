-- Estrategista de Campanhas automático — checklist de etapas gerado ao "Ativar"
-- uma campanha no Planner de Datas. Rodar no Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS campanha_etapas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  campanha_nome text NOT NULL,
  campanha_data date NOT NULL,       -- data da campanha (ex: Dia dos Pais -> 2026-08-10)
  dias_antes integer NOT NULL,       -- 30,20,15,10,7,5,3,1,0 (0 = dia da campanha)
  titulo text NOT NULL,
  descricao text,
  concluida boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campanha_etapas_salao_campanha
  ON campanha_etapas (salao_id, campanha_nome, campanha_data);

ALTER TABLE campanha_etapas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campanha_etapas_all" ON campanha_etapas;
CREATE POLICY "campanha_etapas_all" ON campanha_etapas
  FOR ALL TO authenticated
  USING      (salao_id::text = my_salao_id())
  WITH CHECK (salao_id::text = my_salao_id());

-- Verificação
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'campanha_etapas';
SELECT policyname FROM pg_policies WHERE tablename = 'campanha_etapas';
