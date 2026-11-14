-- supabase/migrations/021_servicos_cadastro_profs.sql
--
-- "Profissionais e Comissão" do modal de Serviço nunca era salvo: salvarServicoSupa/
-- atualizarServicoSupa só enviavam nome/cat/dur/preco/cor, e carregarServicosSupa
-- nunca lia esse campo de volta. Por isso, ao reabrir um serviço pra editar (ou só
-- recarregar a página), os profissionais escolhidos sempre apareciam vazios — o
-- dado nunca existiu no banco, não era só um problema de tela.
--
-- "add column if not exists" -> pode rodar de novo sem erro, mesmo se a coluna
-- já existir.

alter table if exists public.servicos_cadastro
  add column if not exists profs jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';

select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'servicos_cadastro'
  and column_name = 'profs';
