-- supabase/migrations/20261114_profissional_id_agendamentos.sql
--
-- Passo 2 do pedido "gravar o id do colaborador, não apelido": coluna
-- NULLABLE pra não quebrar nada existente. O código ainda NÃO escreve
-- nela — só depois que essa migration rodar é seguro ligar a escrita
-- (senão todo INSERT/UPDATE de agendamento quebra por coluna
-- inexistente). Ver próximo commit pra isso.
alter table if exists public.agendamentos
  add column if not exists profissional_id uuid references public.colaboradores(id);

-- Conferência
select column_name, data_type
from information_schema.columns
where table_schema='public' and table_name='agendamentos' and column_name='profissional_id';
