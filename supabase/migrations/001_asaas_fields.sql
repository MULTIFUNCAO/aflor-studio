-- Adiciona colunas de controle de assinatura ASAAS na tabela saloes
-- Rodar no Supabase SQL Editor antes de ativar o webhook

ALTER TABLE saloes
  ADD COLUMN IF NOT EXISTS assinatura_id      text,
  ADD COLUMN IF NOT EXISTS plano_ativo_desde  timestamptz;

-- Índice para lookup por assinatura
CREATE INDEX IF NOT EXISTS idx_saloes_assinatura_id
  ON saloes (assinatura_id)
  WHERE assinatura_id IS NOT NULL;

-- Verificar resultado
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'saloes'
ORDER BY ordinal_position;
