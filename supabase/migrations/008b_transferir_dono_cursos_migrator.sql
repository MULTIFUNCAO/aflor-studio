-- Parte B da 008 + fix definitivo de ownership.
-- Tentativa anterior falhou: "permission denied to set role cursos_migrator"
-- — postgres tinha admin_option sobre cursos_migrator, mas no Postgres 16+
-- admin_option não dá automaticamente a capacidade de SET ROLE (isso é
-- controlado separadamente por INHERIT/SET no próprio GRANT de membership).
--
-- Fix: regrava a concessão de membership com INHERIT TRUE e SET TRUE. Com
-- INHERIT TRUE, postgres passa a "ter os privilégios" de cursos_migrator
-- automaticamente (é assim que o Postgres resolve a checagem de "é dono
-- desta tabela?" por baixo dos panos — pg_class_ownercheck considera
-- herança de role) — então nem precisa de SET ROLE explícito pros ALTER
-- TABLE funcionarem. SET TRUE fica de brinde, pra permitir SET ROLE
-- explícito no futuro se precisar.
--
-- Passo 1: lead_id/campanha_id em curso_matriculas. Fechado com COMMIT —
-- garantido mesmo se o passo 2 der algum problema inesperado.
--
-- Passo 2: transfere o dono de TODAS as tabelas de cursos_migrator pra
-- postgres, de vez — descobre a lista dinamicamente no catálogo.
--
-- NÃO mexe nas funções my_aluno_id()/my_auth_uid() — são SECURITY DEFINER,
-- mudar o dono delas mudaria com quais privilégios elas rodam em runtime, e
-- isso é usado em todas as policies de acesso do aluno. Ficam com
-- cursos_migrator, como estão hoje.

-- =====================================================================
-- Passo 0 — dar a postgres o poder de herdar/assumir cursos_migrator
-- =====================================================================

GRANT cursos_migrator TO postgres WITH INHERIT TRUE, SET TRUE;

-- =====================================================================
-- Passo 1 — colunas de rastreio de origem em curso_matriculas
-- (rodando direto como postgres — a herança acima já cobre a checagem
-- de "é dono?" sem precisar de SET ROLE)
-- =====================================================================

ALTER TABLE curso_matriculas ADD COLUMN IF NOT EXISTS lead_id uuid;
ALTER TABLE curso_matriculas ADD COLUMN IF NOT EXISTS campanha_id uuid;
CREATE INDEX IF NOT EXISTS idx_curso_matriculas_lead ON curso_matriculas (lead_id);
CREATE INDEX IF NOT EXISTS idx_curso_matriculas_campanha ON curso_matriculas (campanha_id);

COMMIT;

-- =====================================================================
-- Passo 2 — transferir o dono das tabelas (só tabelas, relkind='r';
-- não toca em funções/views/sequences)
-- =====================================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_roles o ON o.oid = c.relowner
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE o.rolname = 'cursos_migrator' AND n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    EXECUTE format('ALTER TABLE %I OWNER TO postgres', r.relname);
  END LOOP;
END $$;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- Verificação (última consulta) — colunas novas + dono atual de cada
-- tabela curso* (deve mostrar "postgres" em todas agora)
-- =====================================================================

SELECT 'coluna' AS bloco, column_name AS objeto, data_type AS detalhe
FROM information_schema.columns
WHERE table_name = 'curso_matriculas' AND column_name IN ('lead_id','campanha_id')

UNION ALL

SELECT 'dono_tabela', c.relname::text, o.rolname::text
FROM pg_class c
JOIN pg_roles o ON o.oid = c.relowner
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
  AND (c.relname = 'cursos' OR c.relname LIKE 'curso\_%' ESCAPE '\')

ORDER BY bloco, objeto;
