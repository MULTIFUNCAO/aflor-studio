-- Adiciona a coluna intervalo_livre em agendamentos.
--
-- Objetivo: permitir que o profissional "divida" o horário de um
-- atendimento em andamento (ex: coloração — 15 min de aplicação + 40 min
-- de espera + 15 min de finalização) e libere esse intervalo de espera
-- pra agendar outra cliente sem gerar conflito de agenda.
--
-- Formato: jsonb {"inicio":"HH:MM","fim":"HH:MM"} representando o trecho,
-- dentro da duração do atendimento, em que o profissional fica livre.
-- null (padrão) = sem intervalo liberado, comportamento igual a antes.
--
-- A UI (Agenda > popup do atendimento > "Intervalo de espera") já lê e
-- grava essa coluna; sem rodar esta migration, o PATCH feito ao salvar o
-- intervalo falha silenciosamente (coluna inexistente).
alter table public.agendamentos
  add column if not exists intervalo_livre jsonb;
