-- Fix de segurança: curso_certificados_select estava com roles={public} no
-- banco de verdade, apesar do fix_storage_cursos.sql original já dizer
-- TO authenticated — drift entre o que está documentado e o que está de
-- fato aplicado (mesmo tipo de problema de "o arquivo diz uma coisa, o
-- banco tem outra" já visto neste projeto, ex: ownership do cursos_migrator).
--
-- Com roles=public, uma requisição não-autenticada (anon) chega a avaliar a
-- cláusula USING em vez de ser descartada antes disso por não bater a role.
-- Hoje isso não vaza nada na prática porque my_salao_id() devolve NULL pra
-- sessão anônima (SELECT ... WHERE id::text = auth.uid()::text — ver
-- migration 007), e comparar qualquer coisa com NULL nunca é verdadeiro.
-- Mas é defesa em profundidade que vale corrigir — o próprio histórico da
-- 007 é um caso real de uma função auxiliar dessas abrindo brecha sem
-- ninguém perceber, então não vale confiar só nisso pra sempre.
--
-- Mesma condição USING de sempre (nada muda no comportamento esperado pro
-- admin autenticado) — só ajusta a role de public pra authenticated.
-- Rodar no Supabase SQL Editor, projeto "Flora Gestão".

DROP POLICY IF EXISTS "curso_certificados_select" ON storage.objects;

CREATE POLICY "curso_certificados_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'curso-certificados' AND (storage.foldername(name))[1] = my_salao_id());

-- =====================================================================
-- Verificação (última consulta)
-- =====================================================================
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'curso_certificados_select';
