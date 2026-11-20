-- Taxas de Cartão na venda de pacote — só comando ADITIVO (add column if
-- not exists). Nenhum DELETE, UPDATE ou DROP neste arquivo.
-- Rodar no SQL Editor do Supabase quando você aprovar.

alter table public.pacotes_clientes
  add column if not exists valor_bruto numeric,
  add column if not exists taxa_cartao_valor numeric,
  add column if not exists valor_liquido numeric;

-- Conferência (só leitura)
select column_name, data_type from information_schema.columns
where table_name = 'pacotes_clientes'
  and column_name in ('valor_bruto','taxa_cartao_valor','valor_liquido')
order by column_name;
