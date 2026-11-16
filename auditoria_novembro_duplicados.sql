-- Auditoria de novembro inteiro (salão b44dab4f), em 1 linha de resultado
-- cada (mais fácil de colar aqui no chat). Só SELECT, nada é alterado.

-- 1) Agendamentos duplicados (mesmo cliente+data+profissional+valor mais
-- de 1 vez) — mesmo padrão da Vanessa.
with dups as (
  select
    cliente, data, profissional, valor, count(*) as qtd_copias,
    string_agg(id::text, ',') as ids,
    string_agg(status, ',') as status_de_cada
  from agendamentos
  where salao_id::text ilike 'b44dab4f%'
    and data >= '2026-11-01' and data <= '2026-11-30'
  group by cliente, data, profissional, valor
  having count(*) > 1
)
select
  (select count(*) from dups) as total_grupos_duplicados,
  coalesce(string_agg(
    cliente || ' ' || to_char(data,'DD/MM') || ' (' || profissional || ', R$' || valor || '): '
    || qtd_copias || ' cópias [' || status_de_cada || ']',
    '  ;  ' order by qtd_copias desc, data desc
  ), 'nenhum duplicado encontrado') as resumo_duplicados
from dups;

-- 2) servico com "+" (combo) mas servicos_detalhe com <=1 item — padrão
-- do bug da Thaina.
with combos_quebrados as (
  select
    id, cliente, data, hora, profissional, valor, status, servico,
    coalesce(jsonb_array_length(servicos_detalhe::jsonb), 0) as qtd_itens_detalhe
  from agendamentos
  where salao_id::text ilike 'b44dab4f%'
    and data >= '2026-11-01' and data <= '2026-11-30'
    and servico ilike '%+%'
    and coalesce(jsonb_array_length(servicos_detalhe::jsonb), 0) <= 1
)
select
  (select count(*) from combos_quebrados) as total_combos_quebrados,
  coalesce(string_agg(
    cliente || ' ' || to_char(data,'DD/MM') || ' ' || hora || ' (' || profissional || '): "' || servico || '" com só '
    || qtd_itens_detalhe || ' item no detalhe — id ' || id,
    '  ;  ' order by data, hora
  ), 'nenhum combo quebrado encontrado') as resumo_combos_quebrados
from combos_quebrados;
