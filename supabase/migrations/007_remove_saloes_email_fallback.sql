-- Remove o fallback "OR email = auth.email()" de my_salao_id() e das
-- policies de saloes (select/update/delete).
--
-- Causa raiz: o fallback foi criado pra cobrir salões órfãos (saloes.id
-- diferente do auth.uid() real, por reset de senha antigo/migração), mas
-- virou regra permanente de acesso em vez de reconciliação pontual —
-- qualquer sessão autenticada cujo e-mail batesse com o e-mail de contato
-- de QUALQUER salão ganhava acesso completo (leitura E escrita, inclusive
-- apagar o salão) àquele salão. Como my_salao_id() é usada por praticamente
-- toda tabela do sistema (não só `saloes`), o furo se propagava pra
-- clientes/agendamentos/financeiro/comandas/etc. de qualquer salão.
--
-- Achado testando o Portal do Aluno (Fase 6, 23/09/2026): um aluno de
-- teste, logado com e-mail que batia com o e-mail de contato do salão,
-- caiu no painel administrativo completo da Ana Flor ao invés do portal.
--
-- Confirmado seguro rodar: query cruzando saloes com auth.users (ver
-- conversa) retornou 0 salões que dependem hoje do fallback por e-mail
-- pra conseguir logar — todos batem por id = auth.uid() normalmente.
--
-- Rodar no Supabase SQL Editor, projeto "Flora Gestão".

-- =====================================================================
-- 1. my_salao_id() — só id = auth.uid(), sem fallback por email
-- =====================================================================

SET check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.my_salao_id()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id::text FROM saloes WHERE id::text = auth.uid()::text LIMIT 1;
$$;

SET check_function_bodies = on;

-- =====================================================================
-- 2. Policies de saloes — select/update/delete só por id = auth.uid()
--    (saloes_insert já era só por id = auth.uid(), não precisa mexer)
-- =====================================================================

DROP POLICY IF EXISTS "saloes_select" ON saloes;
CREATE POLICY "saloes_select" ON saloes
  FOR SELECT TO authenticated
  USING (id::text = auth.uid()::text);

DROP POLICY IF EXISTS "saloes_update" ON saloes;
CREATE POLICY "saloes_update" ON saloes
  FOR UPDATE TO authenticated
  USING      (id::text = auth.uid()::text)
  WITH CHECK (id::text = auth.uid()::text);

DROP POLICY IF EXISTS "saloes_delete" ON saloes;
CREATE POLICY "saloes_delete" ON saloes
  FOR DELETE TO authenticated
  USING (id::text = auth.uid()::text);

-- =====================================================================
-- 3. Verificação (rodar depois e conferir)
-- =====================================================================

SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'saloes'
ORDER BY policyname;

SELECT prosrc FROM pg_proc WHERE proname = 'my_salao_id';
-- prosrc não deve mais conter "auth.email()"
