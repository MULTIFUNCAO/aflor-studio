-- Módulo "Gestão de Cursos" — Fase 3 (Prioridade 3, frente 3): Certificados.
-- O bucket curso-certificados já existe desde fix_storage_cursos.sql, mas as
-- policies dele só cobrem o admin (path[1] = my_salao_id(), igual
-- curso-materiais). Pra emitir um certificado de verdade e o ALUNO conseguir
-- baixar o próprio PDF, falta uma policy de SELECT pro aluno — mesmo padrão
-- já usado em curso-envios (path[2] = my_aluno_id()).
--
-- 100% aditivo: só ADICIONA uma policy nova, não toca nas 4 policies de admin
-- já existentes (select/insert/update/delete por salao_id). Convenção de path
-- usada pelo código novo: <salao_id>/<aluno_id>/<numero_certificado>.pdf —
-- compatível com a policy de admin existente (ela só olha o 1º segmento).
--
-- Rodar no Supabase SQL Editor, projeto "Flora Gestão".

DROP POLICY IF EXISTS "curso_certificados_select_aluno" ON storage.objects;

CREATE POLICY "curso_certificados_select_aluno" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'curso-certificados' AND (storage.foldername(name))[2] = my_aluno_id()::text);

-- =====================================================================
-- Verificação (última consulta)
-- =====================================================================
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'curso_certificados_%'
ORDER BY policyname;
