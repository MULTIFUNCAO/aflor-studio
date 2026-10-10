-- Bucket de storage pro aluno enviar exercícios do tipo envio_imagem/envio_arquivo
-- (curso_exercicio_envios.arquivo_url). Privado — igual curso-materiais, nunca
-- "TO public", já que é conteúdo do aluno, não material de divulgação.
--
-- Limites aplicados no próprio bucket (enforced pelo Supabase Storage, não é
-- RLS): só imagem (jpg/png/webp) e PDF, máximo 10 MB por arquivo. Vale lembrar
-- que o projeto está no plano Free do Supabase (1 GB de storage no total) —
-- 10 MB por arquivo foi escolhido com essa margem em mente, não é um número
-- arbitrário.
--
-- Convenção de path: <salao_id>/<aluno_id>/<arquivo> — primeiro segmento pro
-- admin enxergar tudo do próprio salão (mesmo padrão de curso-materiais),
-- segundo segmento pro aluno só enxergar/enviar o que é dele.
--
-- Aluno só tem INSERT+SELECT (envia e vê o que mandou) — sem UPDATE/DELETE de
-- propósito: se precisar reenviar, sobe um arquivo novo; evita risco de
-- alterar uma submissão depois que o professor já olhou.
-- Admin só tem SELECT (avaliar o que foi enviado) — não é ele quem escreve
-- aqui.
--
-- Rodar no Supabase SQL Editor, projeto "Flora Gestão".

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'curso-envios', 'curso-envios', false,
  10485760, -- 10 MB em bytes
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname IN ('curso_envios_select_admin','curso_envios_select_aluno','curso_envios_insert_aluno')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

-- Admin: lê os envios de qualquer aluno do próprio salão
CREATE POLICY "curso_envios_select_admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'curso-envios' AND (storage.foldername(name))[1] = my_salao_id());

-- Aluno: envia e vê só os próprios arquivos (2º segmento do path = aluno_id)
CREATE POLICY "curso_envios_select_aluno" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'curso-envios' AND (storage.foldername(name))[2] = my_aluno_id()::text);

CREATE POLICY "curso_envios_insert_aluno" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'curso-envios' AND (storage.foldername(name))[2] = my_aluno_id()::text);

-- =====================================================================
-- Verificação (última consulta, uma tabela só)
-- =====================================================================

SELECT 'bucket' AS bloco, id::text AS objeto,
  ('public=' || public || ', limite=' || file_size_limit || 'B, mimes=' || array_to_string(allowed_mime_types, ','))::text AS detalhe
FROM storage.buckets WHERE id = 'curso-envios'

UNION ALL

SELECT 'policy', policyname::text, cmd::text
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'curso_envios_%'

ORDER BY bloco, objeto;
