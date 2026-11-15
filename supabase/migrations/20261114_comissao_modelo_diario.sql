-- supabase/migrations/20261114_comissao_modelo_diario.sql
--
-- Novo modelo de pagamento "diario" (freelancer): comissão do dia paga no
-- mesmo dia, calculada em cima dos serviços Concluídos que o colaborador
-- executou (valor individual, não o total da comanda). Usa a MESMA tabela
-- comissao_parcelas dos outros modelos (período = o dia inteiro, 1
-- parcela só) — só precisa liberar 'diario' no CHECK de modelo.
--
-- Acha e recria o CHECK constraint da coluna "modelo" dinamicamente (sem
-- precisar saber o nome exato que o Supabase deu a ele).

do $$
declare
  nome_check text;
begin
  select con.conname into nome_check
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
  where rel.relname = 'comissao_config'
    and con.contype = 'c'
    and att.attname = 'modelo';
  if nome_check is not null then
    execute format('alter table public.comissao_config drop constraint %I', nome_check);
  end if;
  alter table public.comissao_config
    add constraint comissao_config_modelo_check
    check (modelo in ('quinzenal','mensal_2x','mensal_1x','personalizado','diario'));
end $$;

do $$
declare
  nome_check text;
begin
  select con.conname into nome_check
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
  where rel.relname = 'comissao_colaborador_config'
    and con.contype = 'c'
    and att.attname = 'modelo';
  if nome_check is not null then
    execute format('alter table public.comissao_colaborador_config drop constraint %I', nome_check);
  end if;
  alter table public.comissao_colaborador_config
    add constraint comissao_colaborador_config_modelo_check
    check (modelo in ('quinzenal','mensal_2x','mensal_1x','personalizado','diario'));
end $$;

-- Conferência
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conname in ('comissao_config_modelo_check','comissao_colaborador_config_modelo_check');
