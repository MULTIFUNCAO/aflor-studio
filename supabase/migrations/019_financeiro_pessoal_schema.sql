-- supabase/migrations/019_financeiro_pessoal_schema.sql
--
-- Reforma do Financeiro Pessoal (Pró-Labore): tira os sócios do localStorage
-- (ficavam só num navegador, não compartilhados entre dispositivos) e cria
-- registro real de retiradas pagas + config de meta de reserva do salão.
-- NÃO RODAR sem aprovação explícita da usuária.

-- 1) Sócios — substitui localStorage['flora_socios'].
create table if not exists public.socios (
  id uuid primary key default gen_random_uuid(),
  salao_id uuid not null,
  nome text not null,
  tipo text not null check (tipo in ('fixo','percentual')),
  valor_fixo numeric not null default 0,
  percentual numeric not null default 0,
  participacao numeric not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_socios_salao on public.socios(salao_id);

-- 2) Retiradas de pró-labore — registro real de cada retirada paga, pra existir
--    histórico e dar pra comparar "quanto já retirou" x "quanto pode retirar" no mês.
create table if not exists public.prolabore_retiradas (
  id uuid primary key default gen_random_uuid(),
  salao_id uuid not null,
  socio_id uuid not null references public.socios(id) on delete cascade,
  mes_referencia date not null, -- sempre dia 1 do mês, ex: 2026-10-01
  valor numeric not null,
  data_pagamento date not null default current_date,
  observacao text,
  created_at timestamptz not null default now()
);
create index if not exists idx_prolabore_retiradas_salao_mes
  on public.prolabore_retiradas(salao_id, mes_referencia);

-- 3) Config financeira por salão — hoje só guarda a meta de reserva e o valor
--    de reserva informado manualmente (1 linha por salão).
create table if not exists public.financeiro_config (
  salao_id uuid primary key,
  meta_reserva numeric not null default 0,
  reserva_atual numeric not null default 0,
  reserva_atualizada_em timestamptz,
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 4. RLS + GRANT (mesmo padrão admin usado em 008_cursos_campanhas_leads.sql,
--    via my_salao_id() já definida em 007_remove_saloes_email_fallback.sql)
-- =====================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['socios','prolabore_retiradas','financeiro_config'])
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
  and table_name in ('socios','prolabore_retiradas','financeiro_config')
order by table_name, ordinal_position;

select tablename, policyname, cmd, qual, with_check
from pg_policies
where tablename in ('socios','prolabore_retiradas','financeiro_config');
