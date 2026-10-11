-- AUDITORIA — só leitura, nada é alterado. Rodar no Supabase SQL Editor.
-- Lista roles de todas as policies de storage.objects dos buckets de Cursos
-- (curso-capas, curso-materiais, curso-certificados, curso-envios), pra achar
-- qualquer outro {public} escondido igual o que foi encontrado em
-- curso_certificados_select.

SELECT policyname, cmd::text, roles::text
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'curso_%'
ORDER BY policyname;
