-- supabase/migrations/20261114_comanda_paga.sql
--
-- Comanda do Atendimento: depois de registrar o pagamento, o botão
-- "Registrar Pagamento" continuava aparecendo (risco de lançar o
-- pagamento em dobro no caixa). Pra mostrar "Pago em dd/mm às hh:mm —
-- R$ X — forma — por quem" e pra permitir "Reabrir comanda" estornando
-- o lançamento certo (não um "parecido" por descrição), precisamos
-- saber DE QUAL atendimento cada lançamento financeiro veio.
--
-- Tudo nullable — não quebra nenhum lançamento/agendamento existente.

alter table if exists public.agendamentos
  add column if not exists pago_em timestamptz,
  add column if not exists forma_pagamento_final text,
  add column if not exists pago_por text;

alter table if exists public.caixa_movimentos
  add column if not exists agendamento_id uuid references public.agendamentos(id) on delete set null;

alter table if exists public.fluxo_lancamentos
  add column if not exists agendamento_id uuid references public.agendamentos(id) on delete set null;

-- Conferência
select table_name, column_name, data_type
from information_schema.columns
where table_schema='public'
  and (
    (table_name='agendamentos' and column_name in ('pago_em','forma_pagamento_final','pago_por'))
    or (table_name in ('caixa_movimentos','fluxo_lancamentos') and column_name='agendamento_id')
  )
order by table_name, column_name;
