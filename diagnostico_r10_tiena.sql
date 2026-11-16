-- Reproduz, linha por linha, a MESMA regra que o app usa pra somar o
-- faturamento da Tiena no dia (função calcularComissaoPeriodo / cálculo
-- de carregarAgendamentosSupa), pra achar de onde vem o R$10 extra
-- (esperado R$270, app mostra R$280). Só SELECT.
--
-- Regra do app por agendamento:
--  - servicos_detalhe com <=1 item (ou nulo): conta a.valor pro profissional
--    da coluna "profissional" (a própria linha).
--  - servicos_detalhe com >1 item: o PRIMEIRO item do array conta pro
--    profissional da coluna "profissional" (não pro profissional
--    GRAVADO DENTRO desse 1º item!) — e cada item ALÉM do primeiro conta
--    pro profissional gravado DENTRO dele. Se o profissional da coluna
--    não bater com o profissional do item[0], é aqui que nasce contagem
--    errada (ela ou alguém pode ser contado(a) 2x, ou com o valor de
--    outro serviço).

select
  a.id,
  a.cliente,
  a.hora,
  a.profissional as profissional_da_linha,
  a.valor as valor_total_comanda,
  coalesce(jsonb_array_length(a.servicos_detalhe::jsonb), 0) as qtd_itens,
  a.servicos_detalhe->0->>'profissional' as item0_profissional,
  a.servicos_detalhe->0->>'nome' as item0_nome,
  a.servicos_detalhe->0->>'valor' as item0_valor,
  -- quanto o app atribui ao profissional DA LINHA (regra do item[0], só
  -- quando tem mais de 1 item; senão é o valor total da comanda)
  case
    when coalesce(jsonb_array_length(a.servicos_detalhe::jsonb),0) > 1
      then (a.servicos_detalhe->0->>'valor')::numeric
    else replace(regexp_replace(a.valor::text, '[^0-9,]', '', 'g'), ',', '.')::numeric
  end as valor_atribuido_ao_profissional_da_linha,
  -- alerta: profissional da linha é Tiena mas o item[0] é de outra pessoa
  -- (ou vice-versa) — contagem errada
  case
    when a.profissional = 'Tiena'
      and coalesce(jsonb_array_length(a.servicos_detalhe::jsonb),0) > 1
      and coalesce(a.servicos_detalhe->0->>'profissional','') <> 'Tiena'
      then '⚠ profissional da linha é Tiena, mas item[0] do combo é de "'||(a.servicos_detalhe->0->>'profissional')||'" — o valor desse item[0] tá sendo contado pra Tiena por engano'
    when a.profissional <> 'Tiena'
      and coalesce(jsonb_array_length(a.servicos_detalhe::jsonb),0) > 1
      and a.servicos_detalhe->0->>'profissional' = 'Tiena'
      then '⚠ item[0] é da Tiena, mas profissional da linha é "'||a.profissional||'" — o valor do item[0] tá indo pra outra pessoa, não pra Tiena'
    else 'ok'
  end as alerta,
  a.servicos_detalhe
from agendamentos a
where a.salao_id::text ilike 'b44dab4f%'
  and a.data = '2026-11-14'
  and (
    a.profissional = 'Tiena'
    or exists (
      select 1 from jsonb_array_elements(coalesce(a.servicos_detalhe::jsonb,'[]'::jsonb)) e
      where e->>'profissional' = 'Tiena'
    )
  )
order by a.hora;
