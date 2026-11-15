-- Auditoria de novembro inteiro (salão b44dab4f), 2 problemas:
-- 1) agendamentos duplicados (mesmo cliente+data+profissional+valor, mais
--    de uma vez) — mesmo padrão da Vanessa.
-- 2) servicos_detalhe com só 1 item mas o nome do serviço (coluna
--    "servico") tem "+" — sinal de combo que devia ter N itens no
--    servicos_detalhe e só tem 1 (o bug que a Thaina teve).
-- Só SELECT, nada é alterado.

-- 1) Duplicados em novembro inteiro.
select
  cliente, data, profissional, valor, count(*) as qtd_copias,
  string_agg(id::text, ', ') as ids,
  string_agg(status, ', ') as status_de_cada,
  string_agg(coalesce(pago_em::text,'-'), ', ') as pago_em_de_cada
from agendamentos
where salao_id::text ilike 'b44dab4f%'
  and data >= '2026-11-01' and data <= '2026-11-30'
group by cliente, data, profissional, valor
having count(*) > 1
order by qtd_copias desc, data desc;

-- 2) servico tem "+" (combo) mas servicos_detalhe só tem 1 item (ou é nulo).
select
  id, cliente, data, hora, profissional, valor, status, servico,
  coalesce(jsonb_array_length(servicos_detalhe::jsonb), 0) as qtd_itens_detalhe,
  servicos_detalhe
from agendamentos
where salao_id::text ilike 'b44dab4f%'
  and data >= '2026-11-01' and data <= '2026-11-30'
  and servico ilike '%+%'
  and coalesce(jsonb_array_length(servicos_detalhe::jsonb), 0) <= 1
order by data, hora;
