-- Permite agrupar as ocorrências geradas por "Repetir atendimento" pra
-- cancelar todas de uma vez (ex: cliente parou de vir). null = atendimento
-- avulso, sem série (comportamento igual a antes). Mesmo uuid em todas as
-- linhas de uma mesma série.
alter table public.agendamentos
  add column if not exists serie_id uuid;

create index if not exists idx_agendamentos_serie_id
  on public.agendamentos(serie_id)
  where serie_id is not null;

-- Confirma que a coluna e o índice foram criados.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'agendamentos'
  and column_name = 'serie_id';
