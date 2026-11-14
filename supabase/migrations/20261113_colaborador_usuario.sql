-- supabase/migrations/20261113_colaborador_usuario.sql
-- (cópia de 022_colaboradores_usuario_senha.sql, salva com esse nome a
-- pedido da usuária pra colar no SQL Editor)
--
-- Login de colaborador por USUÁRIO + SENHA (sem e-mail), mesmo padrão de
-- backend do Portal do Aluno (criar-acesso-aluno: service role cria/atualiza
-- o usuário no Supabase Auth, sem signUp() no client e sem e-mail de
-- confirmação) — mas sem e-mail de verdade: o "usuario" vira um e-mail
-- interno único (usuario@flora.local) só pra existir no Supabase Auth.
--
-- "usuario" é ÚNICO GLOBALMENTE (não só por salão) — decisão explícita da
-- usuária: login.html é uma página só, compartilhada por todos os salões,
-- sem nenhum jeito de saber de antemão "de qual salão" é um usuário digitado
-- sem e-mail. Unicidade por salão exigiria um passo extra pra descobrir o
-- salão antes de converter usuário→e-mail; unicidade global deixa o login
-- com 1 campo só, igual ao Portal do Aluno.

-- 1) Colunas novas
alter table if exists public.colaboradores
  add column if not exists usuario text,
  add column if not exists auth_user_id uuid;

-- 2) Unicidade (parcial — várias linhas com usuario/auth_user_id NULL são OK,
--    só colide quando os dois já têm valor)
create unique index if not exists idx_colaboradores_usuario_unico
  on public.colaboradores (lower(usuario))
  where usuario is not null;

create unique index if not exists idx_colaboradores_auth_user_id_unico
  on public.colaboradores (auth_user_id)
  where auth_user_id is not null;

-- 3) RLS — colaborador precisa conseguir ler a PRÓPRIA linha logo depois de
--    autenticar, antes mesmo de saber seu salao_id (mesmo padrão já usado em
--    curso_alunos_select_proprio, via my_auth_uid() — já existe, criada em
--    005_cursos_schema.sql, não precisa recriar).
drop policy if exists "colaboradores_select_proprio" on public.colaboradores;
create policy "colaboradores_select_proprio" on public.colaboradores
  for select to authenticated
  using (auth_user_id = my_auth_uid() and (status is null or status <> 'Inativo'));

-- 4) my_salao_id() — adiciona um segundo caminho: se auth.uid() não é a
--    própria dona do salão (caminho de sempre, inalterado, primeiro no
--    coalesce), tenta resolver via colaboradores.auth_user_id. Colaborador
--    com status='Inativo' não resolve salao_id nenhum — perde acesso a tudo
--    no instante em que a dona desativa, sem precisar apagar a conta no Auth.
SET check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.my_salao_id()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT id::text FROM saloes WHERE id::text = auth.uid()::text LIMIT 1),
    (SELECT salao_id::text FROM colaboradores
       WHERE auth_user_id = auth.uid() AND (status IS NULL OR status <> 'Inativo')
       LIMIT 1)
  );
$$;

SET check_function_bodies = on;

NOTIFY pgrst, 'reload schema';

-- 5) Conferência
select column_name, data_type
from information_schema.columns
where table_schema='public' and table_name='colaboradores' and column_name in ('usuario','auth_user_id');

select indexname from pg_indexes where tablename='colaboradores' and indexname like 'idx_colaboradores%';

select policyname, cmd, qual from pg_policies where tablename='colaboradores';

select prosrc from pg_proc where proname='my_salao_id';
-- prosrc deve conter "coalesce" e "colaboradores" agora
