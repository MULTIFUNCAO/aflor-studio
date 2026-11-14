-- supabase/migrations/20261114_colaborador_rls_tabelas.sql
--
-- Causa do bug: o painel do colaborador (Eduardo) aparecia com tudo zerado
-- (Agenda, Comandas, Financeiro) mesmo com dados reais existindo — não era
-- bug de JS. O console mostrava 403 do PostgREST nas leituras. A migration
-- 022 corrigiu my_salao_id() pra resolver salao_id também por colaborador
-- (via auth_user_id), mas isso só ajuda em tabelas cuja RLS já usa
-- my_salao_id(). As tabelas abaixo nunca tiveram policy nenhuma pra
-- "authenticated" além da dona — então, mesmo com my_salao_id() certo,
-- não existia policy nenhuma que deixasse um colaborador ler/escrever
-- nelas. É por isso que Colaboradores/Financeiro (outras tabelas, que já
-- tinham policy usando my_salao_id()) funcionavam, e Agenda/Comandas/Caixa
-- não.
--
-- Estas policies são ADITIVAS (nomes novos, não substituem nada existente)
-- — múltiplas policies permissivas pro mesmo comando são somadas com OR,
-- então isso só AMPLIA acesso, nunca restringe o que já funcionava pra
-- dona do salão.
--
-- Critério do que ganhou cada comando: somente o que o front-end já faz
-- hoje pra um colaborador (Agenda/Comandas/Caixa/Financeiro ganham select+
-- insert+update, sem delete — nenhum fluxo de colaborador apaga linha
-- dessas tabelas direto; só zera/edita campos). Catálogos (servicos_cadastro,
-- produtos) e remuneracoes ganham só select — colaborador consulta preço/
-- comissão, não edita catálogo. caixa_ajustes (correção manual de saldo)
-- ficou só com select por ser uma ação sensível, sem permissão de
-- colaborador dedicada ainda no sistema de permissões.
--
-- A autorização fina (ex: só quem tem fin_receber_pagamentos realmente usa
-- a tela que grava em caixa_movimentos) continua sendo feita na UI
-- (temPermissao/colabPermitido), igual já era feito pras tabelas que já
-- funcionavam — RLS aqui só garante o isolamento por salão, não a
-- permissão fina por colaborador.

do $$
declare
  tabelas_rw text[] := array['agendamentos','comandas','caixa_estado','caixa_movimentos','fluxo_lancamentos','clientes'];
  tabelas_select text[] := array['servicos_cadastro','produtos','remuneracoes','caixa_ajustes'];
  t text;
begin
  foreach t in array tabelas_rw loop
    execute format('drop policy if exists %I on public.%I', t||'_colaborador_rw', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (salao_id = my_salao_id())',
      t||'_colaborador_rw_select', t
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (salao_id = my_salao_id())',
      t||'_colaborador_rw_insert', t
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (salao_id = my_salao_id()) with check (salao_id = my_salao_id())',
      t||'_colaborador_rw_update', t
    );
  end loop;

  foreach t in array tabelas_select loop
    execute format('drop policy if exists %I on public.%I', t||'_colaborador_select', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (salao_id = my_salao_id())',
      t||'_colaborador_select', t
    );
  end loop;
end $$;

-- Conferência: lista as policies novas, uma linha por tabela/comando.
select tablename, policyname, cmd
from pg_policies
where policyname like '%_colaborador_rw_%' or policyname like '%_colaborador_select'
order by tablename, cmd;
