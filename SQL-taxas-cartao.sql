-- Taxas de Cartão — só comandos ADITIVOS (create table if not exists /
-- add column if not exists). Nenhum DELETE, UPDATE ou DROP neste arquivo.
-- Rodar no SQL Editor do Supabase quando você aprovar.

-- 1) Taxas por forma de pagamento, padrão do salão (só a dona edita).
--    Linha única por salão (upsert onConflict:'salao_id' no app).
create table if not exists public.config_taxas_cartao (
  salao_id uuid primary key references public.saloes(id) on delete cascade,
  debito_pct numeric,
  credito_vista_pct numeric,
  credito_parcelado_pct numeric,
  updated_at timestamptz not null default now()
);

alter table public.config_taxas_cartao enable row level security;

drop policy if exists "config_taxas_cartao_select" on public.config_taxas_cartao;
create policy "config_taxas_cartao_select" on public.config_taxas_cartao
  for select to authenticated using (salao_id::text = my_salao_id());

drop policy if exists "config_taxas_cartao_dona_write" on public.config_taxas_cartao;
create policy "config_taxas_cartao_dona_write" on public.config_taxas_cartao
  for all to authenticated
  using (salao_id::text = my_salao_id() and not exists (select 1 from public.colaboradores c where c.auth_user_id = auth.uid()))
  with check (salao_id::text = my_salao_id() and not exists (select 1 from public.colaboradores c where c.auth_user_id = auth.uid()));

-- 2) Regra por profissional (líquido/bruto) — reaproveita a tabela já
-- existente de regra de pagamento por colaborador. Sem padrão do salão
-- pra esse campo, de propósito (só por profissional).
alter table public.comissao_colaborador_config
  add column if not exists comissao_base text check (comissao_base in ('liquido','bruto'));
-- null = o profissional nunca configurou -> app trata como 'liquido'.

-- 3) Bruto/taxa/líquido gravados no pagamento (auditoria, por atendimento).
--    Ficam NULL em todo pagamento já existente e em qualquer pagamento
--    sem cartão/sem taxa configurada — não altera nada retroativo.
alter table public.agendamentos
  add column if not exists valor_bruto numeric,
  add column if not exists taxa_cartao_valor numeric,
  add column if not exists valor_liquido numeric;

-- Conferência (só leitura)
select column_name, data_type from information_schema.columns
where table_name = 'config_taxas_cartao' order by ordinal_position;
select column_name from information_schema.columns
where table_name = 'comissao_colaborador_config' and column_name = 'comissao_base';
select column_name from information_schema.columns
where table_name = 'agendamentos' and column_name in ('valor_bruto','taxa_cartao_valor','valor_liquido');
select tablename, policyname, cmd from pg_policies
where tablename = 'config_taxas_cartao'
order by policyname, cmd;
