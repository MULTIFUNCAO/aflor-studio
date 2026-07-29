-- Correção: a migration 003 assumiu, com base no código do app, que as colunas de
-- data de nascimento/observações em `clientes` se chamavam `nascimento`/`observacoes`.
-- Uma verificação direta no schema real mostrou que sempre foram `nasc`/`obs` — e que,
-- por causa disso, salvarClienteSupa() no app estava silenciosamente falhando ao
-- salvar clientes novos há tempos (o catch(e){} engolia o erro sem avisar ninguém).
-- Rodar no Supabase SQL Editor.

-- Remove a coluna observacoes criada por engano na migration 003 (estava vazia/sem uso —
-- a coluna obs já existente cumpre o mesmo papel).
ALTER TABLE clientes DROP COLUMN IF EXISTS observacoes;

-- Concede ao "anon" as permissões corretas nas colunas reais (substitui o GRANT
-- anterior que citava a coluna inexistente "nascimento").
GRANT INSERT (nome, tel, cpf, nasc, endereco, obs, ultima, salao_id) ON clientes TO anon;

NOTIFY pgrst, 'reload schema';

-- Verificação
SELECT column_name FROM information_schema.columns
WHERE table_name = 'clientes' ORDER BY ordinal_position;
