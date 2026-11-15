-- Corrige SÓ os 2 itens que você indicou no servicos_detalhe da comanda
-- "correta" da Vanessa (14/11, paga às 02:10, 6 serviços) — Pedicure e
-- Manicure. Os outros 4 itens do array ficam exatamente como estão hoje
-- (não foram reconfirmados, então não arrisco reescrever o valor/
-- profissional deles). Roda DEPOIS de limpeza_vanessa_13_copias.sql
-- (precisa sobrar só essa linha pra não corrigir a errada por engano).
-- Não toca no caixa.

-- Passo 1: confirma que ainda é 1 linha só, e mostra o servicos_detalhe
-- ATUAL (confira os outros 4 itens aqui antes de rodar o update).
select id, cliente, data, hora, status, pago_em, valor, servicos_detalhe
from agendamentos
where salao_id::text ilike 'b44dab4f%'
  and data = '2026-11-14'
  and cliente = 'Vanessa'
  and status = 'Concluído';

-- Passo 2: substitui só os elementos "Pedicure" e "Manicure" dentro do
-- array, mantendo os demais intactos (via CASE dentro do jsonb_agg).
update agendamentos a
set servicos_detalhe = sub.novo_detalhe
from (
  select
    ag.id,
    jsonb_agg(
      case
        when elem->>'nome' = 'Pedicure' then jsonb_build_object(
          'nome', elem->>'nome',
          'valor', 50,
          'profissional', 'Tiena',
          'profissional_id', (select id from colaboradores where nome = 'Tiena' and salao_id::text ilike 'b44dab4f%'),
          'hora', elem->'hora',
          'duracao_min', elem->'duracao_min'
        )
        when elem->>'nome' = 'Manicure' then jsonb_build_object(
          'nome', elem->>'nome',
          'valor', 50,
          'profissional', 'Kauane',
          'profissional_id', (select id from colaboradores where nome = 'Kauane' and salao_id::text ilike 'b44dab4f%'),
          'hora', elem->'hora',
          'duracao_min', elem->'duracao_min'
        )
        else elem
      end
      order by ordem
    ) as novo_detalhe
  from agendamentos ag, jsonb_array_elements(ag.servicos_detalhe::jsonb) with ordinality as t(elem, ordem)
  where ag.salao_id::text ilike 'b44dab4f%'
    and ag.data = '2026-11-14'
    and ag.cliente = 'Vanessa'
    and ag.status = 'Concluído'
  group by ag.id
) sub
where a.id = sub.id
returning a.id, a.cliente, a.servicos_detalhe;

-- Passo 3: confirmação final.
select id, cliente, data, hora, status, valor, servicos_detalhe
from agendamentos
where salao_id::text ilike 'b44dab4f%'
  and data = '2026-11-14'
  and cliente = 'Vanessa';
