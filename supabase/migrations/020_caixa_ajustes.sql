-- supabase/migrations/020_caixa_ajustes.sql
--
-- "Ajustar Saldo" do card Saldo em Caixa (Fluxo de Caixa). O card soma TODO
-- o histórico confirmado em fluxo_lancamentos (receita - despesa) desde o
-- início do salão, não só o mês atual — por isso ele não zera mesmo sem
-- lançamentos no mês: o saldo é acumulado, e o caixa real pode ter saído
-- desse valor por motivos que não passam pelo sistema (retirada em dinheiro,
-- fechamento de ciclo anterior, contagem física diferente, etc).
--
-- Esta tabela guarda cada ajuste manual como um registro separado (quem
-- ajustou, quando, de quanto pra quanto) e SOMA junto no cálculo do saldo —
-- sem tocar em fluxo_lancamentos, então não cria despesa no mês nem afeta
-- Receitas/Despesas/DRE/Atendimentos/Ticket médio, que continuam lendo só
-- fluxo_lancamentos.
--
-- NÃO RODAR sem aprovação explícita da usuária.

create table if not exists public.caixa_ajustes (
  id uuid primary key default gen_random_uuid(),
  salao_id uuid not null,
  saldo_anterior numeric not null,
  saldo_novo numeric not null,
  diferenca numeric not null,
  motivo text,
  usuario text,
  created_at timestamptz not null default now()
);
create index if not exists idx_caixa_ajustes_salao on public.caixa_ajustes(salao_id);

-- RLS + GRANT (mesmo padrão admin usado em 019_financeiro_pessoal_schema.sql,
-- via my_salao_id() já definida em 007_remove_saloes_email_fallback.sql)
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['caixa_ajustes'])
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

select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'caixa_ajustes'
order by ordinal_position;

select tablename, policyname, cmd, qual, with_check
from pg_policies
where tablename = 'caixa_ajustes';
