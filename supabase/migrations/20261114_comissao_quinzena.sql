-- supabase/migrations/20261114_comissao_quinzena.sql
--
-- Pagamento de comissão por período, configurável POR COLABORADOR (não é
-- uma regra única do salão — cada colaborador pode ter um modelo
-- diferente, ex: Eduardo em "mensal 2x" enquanto o resto do time fica no
-- padrão quinzenal).
--
-- Modelo 'quinzenal': período 1 a quinz_fechamento_dia1 (padrão 15),
-- pago quinz_dias_pagamento_q1 dias corridos depois (padrão 2 -> dia 17);
-- período quinz_fechamento_dia1+1 até o último dia do mês, pago no
-- quinz_dia_util_pagamento_q2-ésimo dia útil (padrão 5º) do mês seguinte.
--
-- Modelo 'mensal_2x': período = mês inteiro (dia 1 ao último dia).
-- 2 parcelas sobre o MESMO período: parcela 1 = mensal_pct_parcela1%
-- (padrão 50%) paga no mensal_dia_util_parcela1-ésimo dia útil (padrão
-- 5º) do mês seguinte; parcela 2 = resto, paga no dia fixo
-- mensal_dia_fixo_parcela2 (padrão 20) do mês seguinte.
--
-- Dia útil = segunda a sexta, sem feriados nacionais (calculados em JS:
-- fixos + Páscoa/Sexta Santa/Corpus Christi — sem tabela própria), com
-- sábado contando como dia útil se sabado_conta_dia_util=true.
--
-- salario_fixo é opcional, somado à comissão (dividido entre as parcelas
-- do mês) — "vou confirmar depois se o Eduardo tem", por enquanto só o
-- campo existe, sem valor obrigatório.
--
-- Enquanto uma parcela não é fechada pela dona, o valor é calculado ao
-- vivo (agendamentos Concluído x % do colaborador, mesma regra já usada
-- no painel) — comissao_parcelas só guarda o snapshot CONGELADO depois
-- do fechamento, serve de histórico/registro de pagamento.

-- Regra padrão do SALÃO — aplicada a todo colaborador que não tiver uma
-- regra própria em comissao_colaborador_config (ex: colaborador recém
-- cadastrado, antes de a dona trocar o modelo dele). Mesmas colunas de
-- regra que a tabela por colaborador, sem colaborador_id/salario_fixo
-- (salário fixo é sempre por pessoa, nunca um padrão do salão).
create table if not exists public.comissao_config (
  salao_id uuid primary key references public.saloes(id) on delete cascade,
  modelo text not null default 'quinzenal' check (modelo in ('quinzenal','mensal_2x','mensal_1x','personalizado')),
  quinz_fechamento_dia1 int not null default 15,
  quinz_dias_pagamento_q1 int not null default 2,
  quinz_ajuste_fim_semana text not null default 'antecipar' check (quinz_ajuste_fim_semana in ('antecipar','adiar')),
  quinz_dia_util_pagamento_q2 int not null default 5,
  mensal_pct_parcela1 numeric not null default 50,
  mensal_dia_util_parcela1 int not null default 5,
  mensal_dia_fixo_parcela2 int not null default 20,
  sabado_conta_dia_util boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Regra por COLABORADOR — sobrepõe a regra padrão do salão só pra essa
-- pessoa (ex: Eduardo em "mensal 2x" enquanto o resto do time usa o
-- padrão quinzenal do salão). Mudar a regra só vale pra períodos ainda
-- não fechados — comissao_parcelas já fechada/paga nunca é recalculada.
create table if not exists public.comissao_colaborador_config (
  colaborador_id bigint primary key references public.colaboradores(id) on delete cascade,
  salao_id uuid not null references public.saloes(id) on delete cascade,
  modelo text not null default 'quinzenal' check (modelo in ('quinzenal','mensal_2x','mensal_1x','personalizado')),
  quinz_fechamento_dia1 int not null default 15,
  quinz_dias_pagamento_q1 int not null default 2,
  quinz_ajuste_fim_semana text not null default 'antecipar' check (quinz_ajuste_fim_semana in ('antecipar','adiar')),
  quinz_dia_util_pagamento_q2 int not null default 5,
  mensal_pct_parcela1 numeric not null default 50,
  mensal_dia_util_parcela1 int not null default 5,
  mensal_dia_fixo_parcela2 int not null default 20,
  sabado_conta_dia_util boolean not null default false,
  salario_fixo numeric,
  updated_at timestamptz not null default now()
);

create table if not exists public.comissao_parcelas (
  id bigint generated always as identity primary key,
  salao_id uuid not null references public.saloes(id) on delete cascade,
  colaborador_id bigint not null references public.colaboradores(id) on delete cascade,
  periodo_inicio date not null,
  periodo_fim date not null,
  parcela_num int not null default 1 check (parcela_num in (1,2)),
  parcela_pct numeric not null default 100,
  data_pagamento_prevista date not null,
  qtd_atendimentos int not null default 0,
  faturamento numeric not null default 0,
  comissao_pct numeric not null default 0,
  valor_comissao numeric not null default 0,
  salario_fixo_incluso numeric not null default 0,
  status text not null default 'fechada' check (status in ('fechada','paga')),
  pago_em timestamptz,
  pago_por text,
  forma_pagamento text check (forma_pagamento in ('dinheiro','pix','transferencia')),
  valor_divergente numeric,
  fluxo_lancamento_id bigint,
  criado_em timestamptz not null default now(),
  unique(colaborador_id, periodo_inicio, periodo_fim, parcela_num)
);

alter table public.comissao_config enable row level security;
alter table public.comissao_colaborador_config enable row level security;
alter table public.comissao_parcelas enable row level security;

-- comissao_config (padrão do salão): qualquer autenticado do salão lê;
-- só a dona grava.
drop policy if exists "comissao_config_select" on public.comissao_config;
create policy "comissao_config_select" on public.comissao_config
  for select to authenticated using (salao_id = my_salao_id());

drop policy if exists "comissao_config_dona_write" on public.comissao_config;
create policy "comissao_config_dona_write" on public.comissao_config
  for all to authenticated
  using (salao_id = my_salao_id() and not exists (select 1 from public.colaboradores c where c.auth_user_id = auth.uid()))
  with check (salao_id = my_salao_id() and not exists (select 1 from public.colaboradores c where c.auth_user_id = auth.uid()));

-- comissao_colaborador_config: colaborador autenticado lê a PRÓPRIA regra
-- (precisa saber quando recebe); só a dona cria/edita regra de qualquer
-- colaborador do salão.
drop policy if exists "comissao_colab_config_select" on public.comissao_colaborador_config;
create policy "comissao_colab_config_select" on public.comissao_colaborador_config
  for select to authenticated using (salao_id = my_salao_id());

drop policy if exists "comissao_colab_config_dona_write" on public.comissao_colaborador_config;
create policy "comissao_colab_config_dona_write" on public.comissao_colaborador_config
  for all to authenticated
  using (salao_id = my_salao_id() and not exists (select 1 from public.colaboradores c where c.auth_user_id = auth.uid()))
  with check (salao_id = my_salao_id() and not exists (select 1 from public.colaboradores c where c.auth_user_id = auth.uid()));

-- comissao_parcelas: colaborador só LÊ (o app filtra pra ele ver só as
-- próprias linhas); fechar parcela / marcar como pago é só da dona —
-- mesmo nível de caixa_ajustes.
drop policy if exists "comissao_parcelas_select" on public.comissao_parcelas;
create policy "comissao_parcelas_select" on public.comissao_parcelas
  for select to authenticated using (salao_id = my_salao_id());

drop policy if exists "comissao_parcelas_dona_write" on public.comissao_parcelas;
create policy "comissao_parcelas_dona_write" on public.comissao_parcelas
  for all to authenticated
  using (salao_id = my_salao_id() and not exists (select 1 from public.colaboradores c where c.auth_user_id = auth.uid()))
  with check (salao_id = my_salao_id() and not exists (select 1 from public.colaboradores c where c.auth_user_id = auth.uid()));

-- Conferência
select tablename, policyname, cmd from pg_policies
where tablename in ('comissao_config','comissao_colaborador_config','comissao_parcelas')
order by tablename, cmd;
