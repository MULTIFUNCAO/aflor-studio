-- ============================================================
-- FLORA GESTÃO — Buckets de Storage do módulo de Cursos
-- Cria curso-capas / curso-materiais / curso-certificados
-- (Fase 2 do módulo de Cursos previa esses 3, upload de capa e
-- apostila já estava implementado no código mas falhava com
-- "Bucket not found" — buckets nunca tinham sido criados de fato).
-- Rodar no Supabase SQL Editor, projeto "Flora Gestão".
-- ============================================================

-- ============================================================
-- BLOCO 1 — Criar os 3 buckets (públicos: o código já usa
-- getPublicUrl() para exibir capa de curso/combo sem exigir
-- token; escrita continua controlada por RLS abaixo, só leitura
-- é liberada geral).
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('curso-capas', 'curso-capas', true),
  ('curso-materiais', 'curso-materiais', true),
  ('curso-certificados', 'curso-certificados', true)
on conflict (id) do nothing;


-- ============================================================
-- BLOCO 2 — Policies de storage.objects
-- Path usado pelo app: <salao_id>/<resto do caminho> — mesmo
-- padrão de isolamento por salão já usado nas tabelas via
-- my_salao_id() (ver rls_flora.sql). (storage.foldername(name))[1]
-- extrai o primeiro segmento de pasta do caminho do arquivo.
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname IN (
        'curso_capas_select','curso_capas_insert','curso_capas_update','curso_capas_delete',
        'curso_materiais_select','curso_materiais_insert','curso_materiais_update','curso_materiais_delete',
        'curso_certificados_select','curso_certificados_insert','curso_certificados_update','curso_certificados_delete'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

-- curso-capas — leitura pública (bucket público), escrita restrita ao próprio salão
CREATE POLICY "curso_capas_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'curso-capas');

CREATE POLICY "curso_capas_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'curso-capas' AND (storage.foldername(name))[1] = my_salao_id());

CREATE POLICY "curso_capas_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'curso-capas' AND (storage.foldername(name))[1] = my_salao_id())
  WITH CHECK (bucket_id = 'curso-capas' AND (storage.foldername(name))[1] = my_salao_id());

CREATE POLICY "curso_capas_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'curso-capas' AND (storage.foldername(name))[1] = my_salao_id());

-- curso-materiais — mesmo padrão
CREATE POLICY "curso_materiais_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'curso-materiais');

CREATE POLICY "curso_materiais_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'curso-materiais' AND (storage.foldername(name))[1] = my_salao_id());

CREATE POLICY "curso_materiais_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'curso-materiais' AND (storage.foldername(name))[1] = my_salao_id())
  WITH CHECK (bucket_id = 'curso-materiais' AND (storage.foldername(name))[1] = my_salao_id());

CREATE POLICY "curso_materiais_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'curso-materiais' AND (storage.foldername(name))[1] = my_salao_id());

-- curso-certificados — mesmo padrão (bucket ainda sem código de upload usando ele hoje, criado por completude/Fase 1)
CREATE POLICY "curso_certificados_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'curso-certificados');

CREATE POLICY "curso_certificados_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'curso-certificados' AND (storage.foldername(name))[1] = my_salao_id());

CREATE POLICY "curso_certificados_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'curso-certificados' AND (storage.foldername(name))[1] = my_salao_id())
  WITH CHECK (bucket_id = 'curso-certificados' AND (storage.foldername(name))[1] = my_salao_id());

CREATE POLICY "curso_certificados_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'curso-certificados' AND (storage.foldername(name))[1] = my_salao_id());


-- ============================================================
-- BLOCO 3 — Verificação (rodar depois e conferir o resultado)
-- ============================================================

SELECT id, name, public FROM storage.buckets
WHERE id IN ('curso-capas','curso-materiais','curso-certificados');

SELECT policyname, cmd, roles FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE 'curso_%'
ORDER BY policyname;
