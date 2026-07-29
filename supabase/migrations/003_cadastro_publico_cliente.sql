-- Link de Cadastro Público — cliente se cadastra sozinho (sem login) via
-- floragestao.com.br/cadastro-cliente.html?s=<salao_id>
-- Rodar no Supabase SQL Editor.

-- Novos campos em clientes (usados hoje só internamente para colaboradores)
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS observacoes text;

-- Funções SECURITY DEFINER: permitem ao formulário público validar o salão e
-- checar telefone duplicado SEM dar a "anon" nenhum SELECT direto em saloes/clientes
-- (mesmo padrão de my_salao_id() em rls_flora.sql — evita vazar dados de outros salões).

CREATE OR REPLACE FUNCTION public.salao_existe(p_salao_id text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM saloes WHERE id::text = p_salao_id);
$$;

CREATE OR REPLACE FUNCTION public.cliente_tel_existe(p_salao_id text, p_tel text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM clientes
    WHERE salao_id::text = p_salao_id AND tel = p_tel
  );
$$;

GRANT EXECUTE ON FUNCTION public.salao_existe(text) TO anon;
GRANT EXECUTE ON FUNCTION public.cliente_tel_existe(text, text) TO anon;

-- Policy nova: "anon" pode INSERIR em clientes (só INSERT — sem SELECT/UPDATE/DELETE),
-- e só se o salao_id for real e não houver já um cliente com esse telefone no salão.
-- A policy authenticated_all existente (rls_flora.sql) continua intacta para o app logado.
DROP POLICY IF EXISTS "clientes_insert_publico" ON clientes;
CREATE POLICY "clientes_insert_publico" ON clientes
  FOR INSERT TO anon
  WITH CHECK (
    salao_existe(salao_id::text)
    AND NOT cliente_tel_existe(salao_id::text, tel)
  );

-- Verificação
SELECT column_name FROM information_schema.columns
WHERE table_name = 'clientes' AND column_name IN ('cpf','observacoes');
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'clientes';
