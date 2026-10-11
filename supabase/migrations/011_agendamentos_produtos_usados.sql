-- "Produtos usados" no Novo Agendamento era capturado na tela mas nunca ia pro banco
-- nem entrava no total a pagar da comanda — ficava só na memória do navegador e
-- sumia no reload. Cada item: {nome, valor}.
alter table public.agendamentos
  add column if not exists produtos_usados jsonb;

-- Confirma que a coluna foi criada.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'agendamentos'
  and column_name = 'produtos_usados';
