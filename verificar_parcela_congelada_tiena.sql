-- Confere se existe uma parcela JÁ FECHADA (congelada) pra Tiena que
-- toque 14/11 — se existir, a tela "Comissões a Pagar" usa esse valor
-- congelado em vez de recalcular ao vivo, e é de onde pode vir o R$280
-- (ex: um fechamento feito antes dos 4 serviços dela estarem todos
-- linkados certinho). Só SELECT.

select
  cp.id, cp.colaborador_id, cp.periodo_inicio, cp.periodo_fim, cp.parcela_num,
  cp.qtd_atendimentos, cp.faturamento, cp.comissao_pct, cp.valor_comissao,
  cp.status, cp.pago_em, cp.forma_pagamento
from comissao_parcelas cp
join colaboradores c on c.id = cp.colaborador_id
where c.salao_id::text ilike 'b44dab4f%'
  and c.nome = 'Tiena'
  and cp.periodo_inicio <= '2026-11-14'
  and cp.periodo_fim >= '2026-11-14'
order by cp.periodo_inicio;
