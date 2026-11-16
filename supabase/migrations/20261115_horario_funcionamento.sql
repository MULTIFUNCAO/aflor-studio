-- Horário de funcionamento do salão (Configurações > Perfil do Negócio).
-- Usado pela grade da Agenda, pelo seletor de horário do agendamento e
-- pelo indicador "Ocupação Agenda" do painel.

alter table public.saloes
  add column if not exists hora_abertura text default '08:00',
  add column if not exists hora_fechamento text default '22:00',
  add column if not exists dias_funcionamento jsonb default '[0,1,2,3,4,5,6]'::jsonb;

comment on column public.saloes.hora_abertura is 'Horário de abertura, formato HH:MM';
comment on column public.saloes.hora_fechamento is 'Horário de fechamento, formato HH:MM';
comment on column public.saloes.dias_funcionamento is 'Dias da semana que o salão abre, 0=domingo..6=sábado';

-- Valor inicial pedido pro salão b44dab4f: 08:00 às 22:00, todos os dias.
update public.saloes
set hora_abertura = '08:00',
    hora_fechamento = '22:00',
    dias_funcionamento = '[0,1,2,3,4,5,6]'::jsonb
where id::text ilike 'b44dab4f%';

select id, nome_salao, hora_abertura, hora_fechamento, dias_funcionamento
from public.saloes
where id::text ilike 'b44dab4f%';
