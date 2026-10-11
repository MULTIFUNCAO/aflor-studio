-- Fix de segurança + gap funcional no bucket curso-materiais.
--
-- 1) curso_materiais_select estava com roles={public} (mesmo problema achado
--    em curso_certificados_select) — DROP + CREATE com a mesma condição,
--    só ajustando a role pra authenticated.
--
-- 2) Gap funcional: não existia NENHUMA policy de aluno nesse bucket — só a
--    de admin (por salao_id). O portal do aluno já chama createSignedUrl()
--    em curso-materiais (ver abrirMaterialViewer, portal-aluno.html), mas
--    sem essa policy a chamada falha silenciosamente pra qualquer aluno.
--    Path usado pelo upload existente é <salao_id>/<curso_id>/<arquivo> (não
--    <salao_id>/<aluno_id>/... como em curso-envios/curso-certificados) —
--    então a policy do aluno aqui precisa checar o curso_id embutido no
--    path contra a matrícula dele, replicando a MESMA lógica que já existe
--    na RLS da tabela curso_materiais (migration 005, policy
--    "curso_materiais_select_aluno"), só que aplicada ao storage.
--
-- Rodar no Supabase SQL Editor, projeto "Flora Gestão".

DROP POLICY IF EXISTS "curso_materiais_select" ON storage.objects;

CREATE POLICY "curso_materiais_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'curso-materiais' AND (storage.foldername(name))[1] = my_salao_id());

DROP POLICY IF EXISTS "curso_materiais_select_aluno" ON storage.objects;

CREATE POLICY "curso_materiais_select_aluno" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'curso-materiais' AND
    EXISTS (
      SELECT 1 FROM curso_matriculas m
      WHERE m.aluno_id = my_aluno_id()
        AND m.status IN ('matriculado','andamento','concluido')
        AND (
          m.curso_id::text = (storage.foldername(name))[2]
          OR m.combo_id IN (
            SELECT combo_id FROM curso_combo_itens
            WHERE curso_id::text = (storage.foldername(name))[2]
          )
        )
    )
  );

-- =====================================================================
-- Verificação (última consulta)
-- =====================================================================
SELECT policyname, cmd::text, roles::text
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'curso_materiais_%'
ORDER BY policyname;
