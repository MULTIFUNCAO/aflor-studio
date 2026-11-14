-- supabase/migrations/20261114_comissionar_produtos.sql
--
-- Produtos usados num atendimento (ex: Tinta 3.0 Aneethun) agora podem ser
-- cobrados da cliente (somam na comanda/faturamento) ou só registrados como
-- uso interno (não cobrados). Por padrão, o % de comissão do profissional
-- incide só sobre serviços — comissionar produtos também é opcional,
-- configurável aqui por salão.

alter table if exists public.comissao_config
  add column if not exists comissionar_produtos boolean default false;

-- Conferência
select salao_id, comissionar_produtos
from public.comissao_config;
