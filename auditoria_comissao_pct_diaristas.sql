-- Confere o % de comissão gravado em colaboradores.comissao pra quem é
-- modelo "Diário" (Tiena) e pra quem já apareceu com 0% na lista antes
-- (Jenny, Ana Flor) — pra confirmar se "Comissão do mês R$ 0" da Tiena é
-- o mesmo bug de dado (campo comissao zerado/errado no banco) ou só falta
-- de UI pro modelo Diário (isso já corrigi no código).

select
  c.id,
  c.nome,
  c.comissao as comissao_colaboradores_pct,
  ccc.modelo as modelo_pagamento_configurado
from colaboradores c
left join comissao_colaborador_config ccc
  on ccc.colaborador_id = c.id
where c.salao_id::text ilike 'b44dab4f%'
  and c.nome in ('Tiena','Jenny','Ana Flor')
order by c.nome;

-- Conferência do valor esperado pra Tiena em 14/11 (Esmaltação Gel R$100 +
-- Pedicure R$60 + Pedicure R$50 + Pedicure R$60 = R$270, pelo % acima).
select
  a.id, a.cliente, a.data, a.hora, a.profissional as profissional_principal,
  elem->>'nome' as servico, elem->>'profissional' as profissional_do_servico,
  (elem->>'valor')::numeric as valor_servico
from agendamentos a, jsonb_array_elements(a.servicos_detalhe::jsonb) elem
where a.salao_id::text ilike 'b44dab4f%'
  and a.data = '2026-11-14'
  and elem->>'profissional' = 'Tiena'
order by a.hora;
