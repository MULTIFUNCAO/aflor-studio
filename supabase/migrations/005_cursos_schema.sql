-- Módulo "Gestão de Cursos" — schema completo (Fase 1).
-- Cria as tabelas do catálogo de cursos/combos, turmas (com ponte pra Agenda),
-- alunos/matrícula/financeiro, presença, portal do aluno (progresso, exercícios,
-- provas, certificados) e notificações — mais a função my_aluno_id() (equivalente
-- a my_salao_id(), mas para a sessão do aluno).
--
-- Convenções replicadas do schema existente (ver 001-004_*.sql):
--   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
--   - salao_id text NOT NULL (não uuid — mesmo padrão de campanha_etapas)
--   - SEM foreign key constraints (convenção do projeto inteiro — nenhuma tabela
--     existente usa REFERENCES; ids são apenas uuid "soltos" + índice)
--   - RLS: policy "authenticated_all"-like por salao_id::text = my_salao_id()
--   - Rodar no Supabase SQL Editor. 100% aditivo — nenhuma tabela existente é alterada.
--
-- Este módulo introduz um segundo tipo de identidade (o Aluno, com Supabase Auth
-- próprio) além do dono/colaborador — daí a função my_aluno_id() e o segundo
-- conjunto de policies (SELECT/INSERT limitado) abaixo do bloco "admin".

-- =====================================================================
-- 1. CATÁLOGO: cursos, módulos, aulas, materiais, exercícios, provas, combos
-- =====================================================================

CREATE TABLE IF NOT EXISTS cursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  nome text NOT NULL,
  descricao text,
  categoria text,
  capa_url text,
  modalidade text NOT NULL DEFAULT 'presencial' CHECK (modalidade IN ('presencial','online','hibrido')),
  carga_horaria_horas numeric,
  carga_horaria_dias integer,
  aulas_totais integer,
  valor_normal numeric,
  valor_promocional numeric,
  gera_certificado boolean NOT NULL DEFAULT true,
  certificado_presenca_minima_pct numeric NOT NULL DEFAULT 75,
  certificado_exige_provas_aprovadas boolean NOT NULL DEFAULT true,
  certificado_exige_exercicios boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_modulos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL,
  salao_id text NOT NULL,
  nome text NOT NULL,
  descricao text,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_aulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id uuid NOT NULL,
  curso_id uuid NOT NULL, -- denormalizado (facilita RLS/queries sem join extra)
  salao_id text NOT NULL,
  titulo text NOT NULL,
  descricao text,
  tipo_conteudo text NOT NULL DEFAULT 'texto' CHECK (tipo_conteudo IN ('video','texto','pdf','misto')),
  video_url text,
  texto_conteudo text,
  duracao_min integer,
  ordem integer NOT NULL DEFAULT 0,
  obrigatoria boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  curso_id uuid NOT NULL,
  modulo_id uuid,
  aula_id uuid,
  nome text NOT NULL,
  arquivo_url text,
  tipo text NOT NULL DEFAULT 'apostila' CHECK (tipo IN ('apostila','pdf','anexo')),
  permite_download boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_exercicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  curso_id uuid NOT NULL,
  modulo_id uuid,
  aula_id uuid,
  titulo text NOT NULL,
  enunciado text,
  tipo text NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto','multipla_escolha','verdadeiro_falso','envio_imagem','envio_arquivo')),
  opcoes jsonb,
  resposta_correta jsonb,
  obrigatorio boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_provas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  curso_id uuid NOT NULL,
  modulo_id uuid,
  titulo text NOT NULL,
  descricao text,
  nota_minima numeric NOT NULL DEFAULT 70,
  tentativas_maximas integer NOT NULL DEFAULT 1,
  tempo_limite_min integer,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_prova_perguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id uuid NOT NULL,
  salao_id text NOT NULL,
  enunciado text NOT NULL,
  tipo text NOT NULL DEFAULT 'multipla_escolha' CHECK (tipo IN ('multipla_escolha','verdadeiro_falso')),
  opcoes jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{id,texto}]
  resposta_correta jsonb NOT NULL,
  pontuacao numeric NOT NULL DEFAULT 1,
  ordem integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS curso_combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  nome text NOT NULL,
  descricao text,
  capa_url text,
  valor_normal numeric,
  valor_promocional numeric,
  gera_certificado boolean NOT NULL DEFAULT true,
  certificado_presenca_minima_pct numeric NOT NULL DEFAULT 75,
  certificado_exige_provas_aprovadas boolean NOT NULL DEFAULT true,
  certificado_exige_exercicios boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_combo_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id uuid NOT NULL,
  curso_id uuid NOT NULL,
  salao_id text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  UNIQUE (combo_id, curso_id)
);

-- =====================================================================
-- 2. TURMAS + PONTE PARA A AGENDA (curso_turma_aulas é mesclada em
--    agendamentosPorData em runtime pelo front — nunca grava em `agendamentos`)
-- =====================================================================

CREATE TABLE IF NOT EXISTS curso_turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  curso_id uuid,
  combo_id uuid,
  nome text NOT NULL,
  professor_id uuid, -- colaboradores.id
  local text,
  modalidade text,
  data_inicio date,
  data_fim date,
  dias_semana jsonb, -- ex [1,3,5]; só auxiliar de geração, não fonte de verdade
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  vagas_maximas integer NOT NULL DEFAULT 0,
  vagas_ocupadas integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'planejada' CHECK (status IN ('planejada','andamento','concluida','cancelada')),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT curso_turmas_curso_xor_combo CHECK (
    (curso_id IS NOT NULL AND combo_id IS NULL) OR (curso_id IS NULL AND combo_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS curso_turma_aulas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL,
  salao_id text NOT NULL,
  curso_id uuid, -- qual curso do combo está sendo dado nesse dia, se aplicável
  aula_id uuid,  -- conteúdo previsto (curso_aulas), opcional
  data date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  profissional_id uuid NOT NULL, -- colaboradores.id
  status text NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada','realizada','cancelada')),
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- 3. ALUNOS, MATRÍCULA E FINANCEIRO (parcelamento real — capacidade nova)
-- =====================================================================

CREATE TABLE IF NOT EXISTS curso_alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  cliente_id uuid, -- clientes.id, vínculo opcional com cadastro existente
  auth_user_id uuid UNIQUE, -- preenchido quando a conta Supabase Auth do aluno é criada
  nome text NOT NULL,
  cpf text,
  email text,
  tel text,
  nasc date,
  endereco text,
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_matriculas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  aluno_id uuid NOT NULL,
  curso_id uuid,
  combo_id uuid,
  turma_id uuid,
  status text NOT NULL DEFAULT 'interessado' CHECK (status IN ('interessado','ficha_enviada','pagamento_pendente','matriculado','andamento','concluido','cancelado')),
  data_matricula date,
  valor_total numeric,
  valor_pago numeric NOT NULL DEFAULT 0,
  forma_pagamento text,
  qtd_parcelas integer NOT NULL DEFAULT 1,
  contrato_url text,
  percentual_presenca numeric NOT NULL DEFAULT 0,
  certificado_liberado boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT curso_matriculas_curso_xor_combo CHECK (
    (curso_id IS NOT NULL AND combo_id IS NULL) OR (curso_id IS NULL AND combo_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS curso_matricula_status_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id uuid NOT NULL,
  salao_id text NOT NULL,
  status_anterior text,
  status_novo text NOT NULL,
  alterado_por text,
  observacao text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_matricula_parcelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id uuid NOT NULL,
  salao_id text NOT NULL,
  numero_parcela integer NOT NULL,
  valor numeric NOT NULL,
  vencimento date NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','pago','atrasado','cancelado')),
  data_pagamento date,
  forma_pagamento text,
  fluxo_lancamento_id uuid, -- id do lançamento correspondente em fluxo_lancamentos/caixa_movimentos, quando baixada
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- 4. PRESENÇA
-- =====================================================================

CREATE TABLE IF NOT EXISTS curso_presencas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_aula_id uuid NOT NULL,
  matricula_id uuid NOT NULL,
  salao_id text NOT NULL,
  status text NOT NULL DEFAULT 'ausente' CHECK (status IN ('presente','ausente','justificada')),
  observacao text,
  registrado_por text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (turma_aula_id, matricula_id)
);

-- =====================================================================
-- 5. PORTAL DO ALUNO: progresso, exercícios, provas, certificados
-- =====================================================================

CREATE TABLE IF NOT EXISTS curso_progresso_conteudo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id uuid NOT NULL,
  salao_id text NOT NULL,
  tipo_conteudo text NOT NULL CHECK (tipo_conteudo IN ('aula','material')),
  aula_id uuid,
  material_id uuid,
  status text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('bloqueado','disponivel','em_andamento','concluido')),
  aberto_em timestamptz,
  concluido_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_exercicio_envios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercicio_id uuid NOT NULL,
  matricula_id uuid NOT NULL,
  salao_id text NOT NULL,
  resposta_texto text,
  resposta_opcao jsonb,
  arquivo_url text,
  status text NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado','em_analise','aprovado','refazer')),
  comentario_professor text,
  corrigido_por text,
  corrigido_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS curso_prova_tentativas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prova_id uuid NOT NULL,
  matricula_id uuid NOT NULL,
  salao_id text NOT NULL,
  numero_tentativa integer NOT NULL DEFAULT 1,
  respostas jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{pergunta_id,resposta}]
  pontuacao_obtida numeric,
  pontuacao_maxima numeric,
  percentual numeric,
  aprovado boolean,
  iniciado_em timestamptz NOT NULL DEFAULT now(),
  finalizado_em timestamptz
);

CREATE TABLE IF NOT EXISTS curso_certificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id uuid NOT NULL,
  salao_id text NOT NULL,
  curso_id uuid,
  combo_id uuid,
  numero_certificado text NOT NULL,
  emitido_em timestamptz NOT NULL DEFAULT now(),
  carga_horaria_horas numeric,
  criterios_atendidos jsonb, -- snapshot: presença%, provas aprovadas, exercícios completos
  pdf_url text,
  qr_code_token text, -- reservado para validação futura via QR code, não usado ainda
  status text NOT NULL DEFAULT 'liberado' CHECK (status IN ('liberado','emitido','revogado')),
  UNIQUE (salao_id, numero_certificado)
);

-- =====================================================================
-- 6. NOTIFICAÇÕES (estrutura preparatória — só grava linhas, sem provedor real)
-- =====================================================================

CREATE TABLE IF NOT EXISTS curso_notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salao_id text NOT NULL,
  destinatario_tipo text NOT NULL CHECK (destinatario_tipo IN ('aluno','professor','admin')),
  destinatario_id uuid,
  tipo_evento text NOT NULL CHECK (tipo_evento IN ('aula_amanha','nova_apostila','exercicio_corrigido','aprovado_prova','certificado_disponivel')),
  titulo text NOT NULL,
  mensagem text,
  entidade_ref jsonb,
  lida boolean NOT NULL DEFAULT false,
  enviada boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- 7. ÍNDICES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_cursos_salao ON cursos (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_modulos_salao ON curso_modulos (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_modulos_curso ON curso_modulos (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_aulas_salao ON curso_aulas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_aulas_modulo ON curso_aulas (modulo_id);
CREATE INDEX IF NOT EXISTS idx_curso_aulas_curso ON curso_aulas (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_materiais_salao ON curso_materiais (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_materiais_curso ON curso_materiais (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_exercicios_salao ON curso_exercicios (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_exercicios_curso ON curso_exercicios (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_provas_salao ON curso_provas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_provas_curso ON curso_provas (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_prova_perguntas_salao ON curso_prova_perguntas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_prova_perguntas_prova ON curso_prova_perguntas (prova_id);
CREATE INDEX IF NOT EXISTS idx_curso_combos_salao ON curso_combos (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_combo_itens_salao ON curso_combo_itens (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_combo_itens_combo ON curso_combo_itens (combo_id);
CREATE INDEX IF NOT EXISTS idx_curso_combo_itens_curso ON curso_combo_itens (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_turmas_salao ON curso_turmas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_turmas_curso ON curso_turmas (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_turmas_combo ON curso_turmas (combo_id);
CREATE INDEX IF NOT EXISTS idx_curso_turmas_professor ON curso_turmas (professor_id);
CREATE INDEX IF NOT EXISTS idx_curso_turma_aulas_salao ON curso_turma_aulas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_turma_aulas_turma ON curso_turma_aulas (turma_id);
CREATE INDEX IF NOT EXISTS idx_curso_turma_aulas_data ON curso_turma_aulas (data);
CREATE INDEX IF NOT EXISTS idx_curso_turma_aulas_profissional ON curso_turma_aulas (profissional_id);
CREATE INDEX IF NOT EXISTS idx_curso_alunos_salao ON curso_alunos (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_alunos_cliente ON curso_alunos (cliente_id);
CREATE INDEX IF NOT EXISTS idx_curso_matriculas_salao ON curso_matriculas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_matriculas_aluno ON curso_matriculas (aluno_id);
CREATE INDEX IF NOT EXISTS idx_curso_matriculas_curso ON curso_matriculas (curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_matriculas_combo ON curso_matriculas (combo_id);
CREATE INDEX IF NOT EXISTS idx_curso_matriculas_turma ON curso_matriculas (turma_id);
CREATE INDEX IF NOT EXISTS idx_curso_matricula_hist_salao ON curso_matricula_status_historico (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_matricula_hist_matricula ON curso_matricula_status_historico (matricula_id);
CREATE INDEX IF NOT EXISTS idx_curso_matricula_parcelas_salao ON curso_matricula_parcelas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_matricula_parcelas_matricula ON curso_matricula_parcelas (matricula_id);
CREATE INDEX IF NOT EXISTS idx_curso_matricula_parcelas_vencimento ON curso_matricula_parcelas (vencimento);
CREATE INDEX IF NOT EXISTS idx_curso_presencas_salao ON curso_presencas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_presencas_turma_aula ON curso_presencas (turma_aula_id);
CREATE INDEX IF NOT EXISTS idx_curso_presencas_matricula ON curso_presencas (matricula_id);
CREATE INDEX IF NOT EXISTS idx_curso_progresso_salao ON curso_progresso_conteudo (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_progresso_matricula ON curso_progresso_conteudo (matricula_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_curso_progresso_aula ON curso_progresso_conteudo (matricula_id, aula_id) WHERE aula_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_curso_progresso_material ON curso_progresso_conteudo (matricula_id, material_id) WHERE material_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_curso_exercicio_envios_salao ON curso_exercicio_envios (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_exercicio_envios_exercicio ON curso_exercicio_envios (exercicio_id);
CREATE INDEX IF NOT EXISTS idx_curso_exercicio_envios_matricula ON curso_exercicio_envios (matricula_id);
CREATE INDEX IF NOT EXISTS idx_curso_prova_tentativas_salao ON curso_prova_tentativas (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_prova_tentativas_prova ON curso_prova_tentativas (prova_id);
CREATE INDEX IF NOT EXISTS idx_curso_prova_tentativas_matricula ON curso_prova_tentativas (matricula_id);
CREATE INDEX IF NOT EXISTS idx_curso_certificados_salao ON curso_certificados (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_certificados_matricula ON curso_certificados (matricula_id);
CREATE INDEX IF NOT EXISTS idx_curso_notificacoes_salao ON curso_notificacoes (salao_id);
CREATE INDEX IF NOT EXISTS idx_curso_notificacoes_destinatario ON curso_notificacoes (destinatario_tipo, destinatario_id);

-- =====================================================================
-- 8. my_aluno_id() — equivalente de my_salao_id() para a sessão do aluno
-- =====================================================================

-- check_function_bodies off: quem aplica esta migration (cursos_migrator) não tem
-- USAGE no schema `auth`, então o Postgres não consegue validar a referência a
-- auth.uid() no CREATE FUNCTION (mesmo sendo SECURITY DEFINER, a validação de corpo
-- roda com o privilégio de quem cria, não de quem executa). Desligar a validação
-- aqui é seguro e não afeta o comportamento em runtime da função.
SET check_function_bodies = off;

-- Wrapper de auth.uid(): existe só para que as policies abaixo (que também não
-- conseguem referenciar auth.* diretamente, pelo mesmo motivo) possam comparar
-- contra um identificador de sessão sem precisar de USAGE no schema auth.
CREATE OR REPLACE FUNCTION public.my_auth_uid()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.my_aluno_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM curso_alunos WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

SET check_function_bodies = on;

GRANT EXECUTE ON FUNCTION public.my_auth_uid() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_aluno_id() TO authenticated;

-- =====================================================================
-- 9. RLS — bloco "admin" (dono/colaborador, sessão do salão): idêntico ao
--    padrão authenticated_all já usado em todas as tabelas do projeto.
-- =====================================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'cursos','curso_modulos','curso_aulas','curso_materiais','curso_exercicios',
    'curso_provas','curso_prova_perguntas','curso_combos','curso_combo_itens',
    'curso_turmas','curso_turma_aulas','curso_alunos','curso_matriculas',
    'curso_matricula_status_historico','curso_matricula_parcelas','curso_presencas',
    'curso_progresso_conteudo','curso_exercicio_envios','curso_prova_tentativas',
    'curso_certificados','curso_notificacoes'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_admin_all" ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY "%s_admin_all" ON %I FOR ALL TO authenticated USING (salao_id::text = my_salao_id()) WITH CHECK (salao_id::text = my_salao_id())',
      t, t
    );
  END LOOP;
END $$;

-- =====================================================================
-- 10. RLS — bloco "aluno" (sessão própria do aluno, via my_aluno_id())
-- =====================================================================

-- Catálogo: SELECT liberado quando o aluno tem matrícula ativa no curso
-- (direto ou via combo) com status em andamento/concluído.
DROP POLICY IF EXISTS "cursos_select_aluno" ON cursos;
CREATE POLICY "cursos_select_aluno" ON cursos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m
    WHERE m.aluno_id = my_aluno_id()
      AND m.status IN ('matriculado','andamento','concluido')
      AND (m.curso_id = cursos.id
           OR m.combo_id IN (SELECT combo_id FROM curso_combo_itens WHERE curso_id = cursos.id))
  ));

DROP POLICY IF EXISTS "curso_modulos_select_aluno" ON curso_modulos;
CREATE POLICY "curso_modulos_select_aluno" ON curso_modulos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m
    WHERE m.aluno_id = my_aluno_id() AND m.status IN ('matriculado','andamento','concluido')
      AND (m.curso_id = curso_modulos.curso_id
           OR m.combo_id IN (SELECT combo_id FROM curso_combo_itens WHERE curso_id = curso_modulos.curso_id))
  ));

DROP POLICY IF EXISTS "curso_aulas_select_aluno" ON curso_aulas;
CREATE POLICY "curso_aulas_select_aluno" ON curso_aulas FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m
    WHERE m.aluno_id = my_aluno_id() AND m.status IN ('matriculado','andamento','concluido')
      AND (m.curso_id = curso_aulas.curso_id
           OR m.combo_id IN (SELECT combo_id FROM curso_combo_itens WHERE curso_id = curso_aulas.curso_id))
  ));

DROP POLICY IF EXISTS "curso_materiais_select_aluno" ON curso_materiais;
CREATE POLICY "curso_materiais_select_aluno" ON curso_materiais FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m
    WHERE m.aluno_id = my_aluno_id() AND m.status IN ('matriculado','andamento','concluido')
      AND (m.curso_id = curso_materiais.curso_id
           OR m.combo_id IN (SELECT combo_id FROM curso_combo_itens WHERE curso_id = curso_materiais.curso_id))
  ));

DROP POLICY IF EXISTS "curso_exercicios_select_aluno" ON curso_exercicios;
CREATE POLICY "curso_exercicios_select_aluno" ON curso_exercicios FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m
    WHERE m.aluno_id = my_aluno_id() AND m.status IN ('matriculado','andamento','concluido')
      AND (m.curso_id = curso_exercicios.curso_id
           OR m.combo_id IN (SELECT combo_id FROM curso_combo_itens WHERE curso_id = curso_exercicios.curso_id))
  ));

DROP POLICY IF EXISTS "curso_provas_select_aluno" ON curso_provas;
CREATE POLICY "curso_provas_select_aluno" ON curso_provas FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m
    WHERE m.aluno_id = my_aluno_id() AND m.status IN ('matriculado','andamento','concluido')
      AND (m.curso_id = curso_provas.curso_id
           OR m.combo_id IN (SELECT combo_id FROM curso_combo_itens WHERE curso_id = curso_provas.curso_id))
  ));

DROP POLICY IF EXISTS "curso_prova_perguntas_select_aluno" ON curso_prova_perguntas;
CREATE POLICY "curso_prova_perguntas_select_aluno" ON curso_prova_perguntas FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_provas p
    JOIN curso_matriculas m ON (m.curso_id = p.curso_id
      OR m.combo_id IN (SELECT combo_id FROM curso_combo_itens WHERE curso_id = p.curso_id))
    WHERE p.id = curso_prova_perguntas.prova_id
      AND m.aluno_id = my_aluno_id() AND m.status IN ('matriculado','andamento','concluido')
  ));

DROP POLICY IF EXISTS "curso_combos_select_aluno" ON curso_combos;
CREATE POLICY "curso_combos_select_aluno" ON curso_combos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m
    WHERE m.aluno_id = my_aluno_id() AND m.status IN ('matriculado','andamento','concluido')
      AND m.combo_id = curso_combos.id
  ));

DROP POLICY IF EXISTS "curso_combo_itens_select_aluno" ON curso_combo_itens;
CREATE POLICY "curso_combo_itens_select_aluno" ON curso_combo_itens FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m
    WHERE m.aluno_id = my_aluno_id() AND m.status IN ('matriculado','andamento','concluido')
      AND m.combo_id = curso_combo_itens.combo_id
  ));

-- Turma/agenda: aluno só vê a própria turma (item 13, "Minha Turma").
DROP POLICY IF EXISTS "curso_turmas_select_aluno" ON curso_turmas;
CREATE POLICY "curso_turmas_select_aluno" ON curso_turmas FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m WHERE m.aluno_id = my_aluno_id() AND m.turma_id = curso_turmas.id
  ));

DROP POLICY IF EXISTS "curso_turma_aulas_select_aluno" ON curso_turma_aulas;
CREATE POLICY "curso_turma_aulas_select_aluno" ON curso_turma_aulas FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM curso_matriculas m WHERE m.aluno_id = my_aluno_id() AND m.turma_id = curso_turma_aulas.turma_id
  ));

-- Identidade/matrícula/financeiro/presença/certificados: SELECT read-only da própria linha.
DROP POLICY IF EXISTS "curso_alunos_select_proprio" ON curso_alunos;
CREATE POLICY "curso_alunos_select_proprio" ON curso_alunos FOR SELECT TO authenticated
  USING (auth_user_id = my_auth_uid());

DROP POLICY IF EXISTS "curso_matriculas_select_aluno" ON curso_matriculas;
CREATE POLICY "curso_matriculas_select_aluno" ON curso_matriculas FOR SELECT TO authenticated
  USING (aluno_id = my_aluno_id());

DROP POLICY IF EXISTS "curso_matricula_parcelas_select_aluno" ON curso_matricula_parcelas;
CREATE POLICY "curso_matricula_parcelas_select_aluno" ON curso_matricula_parcelas FOR SELECT TO authenticated
  USING (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));

DROP POLICY IF EXISTS "curso_presencas_select_aluno" ON curso_presencas;
CREATE POLICY "curso_presencas_select_aluno" ON curso_presencas FOR SELECT TO authenticated
  USING (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));

DROP POLICY IF EXISTS "curso_certificados_select_aluno" ON curso_certificados;
CREATE POLICY "curso_certificados_select_aluno" ON curso_certificados FOR SELECT TO authenticated
  USING (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));

-- Progresso: aluno lê/grava (marcar aula/material como concluído) só da própria matrícula.
DROP POLICY IF EXISTS "curso_progresso_select_aluno" ON curso_progresso_conteudo;
CREATE POLICY "curso_progresso_select_aluno" ON curso_progresso_conteudo FOR SELECT TO authenticated
  USING (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));
DROP POLICY IF EXISTS "curso_progresso_insert_aluno" ON curso_progresso_conteudo;
CREATE POLICY "curso_progresso_insert_aluno" ON curso_progresso_conteudo FOR INSERT TO authenticated
  WITH CHECK (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));
DROP POLICY IF EXISTS "curso_progresso_update_aluno" ON curso_progresso_conteudo;
CREATE POLICY "curso_progresso_update_aluno" ON curso_progresso_conteudo FOR UPDATE TO authenticated
  USING (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()))
  WITH CHECK (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));

-- Exercícios: aluno lê/envia a própria submissão, mas NUNCA corrige (status/comentário
-- só mudam pela policy admin — aluno não tem UPDATE aqui).
DROP POLICY IF EXISTS "curso_exercicio_envios_select_aluno" ON curso_exercicio_envios;
CREATE POLICY "curso_exercicio_envios_select_aluno" ON curso_exercicio_envios FOR SELECT TO authenticated
  USING (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));
DROP POLICY IF EXISTS "curso_exercicio_envios_insert_aluno" ON curso_exercicio_envios;
CREATE POLICY "curso_exercicio_envios_insert_aluno" ON curso_exercicio_envios FOR INSERT TO authenticated
  WITH CHECK (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));

-- Provas: correção é automática e calculada no momento do envio (client), então
-- aluno só precisa de INSERT+SELECT da própria tentativa, nunca UPDATE/DELETE.
DROP POLICY IF EXISTS "curso_prova_tentativas_select_aluno" ON curso_prova_tentativas;
CREATE POLICY "curso_prova_tentativas_select_aluno" ON curso_prova_tentativas FOR SELECT TO authenticated
  USING (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));
DROP POLICY IF EXISTS "curso_prova_tentativas_insert_aluno" ON curso_prova_tentativas;
CREATE POLICY "curso_prova_tentativas_insert_aluno" ON curso_prova_tentativas FOR INSERT TO authenticated
  WITH CHECK (matricula_id IN (SELECT id FROM curso_matriculas WHERE aluno_id = my_aluno_id()));

-- Notificações: aluno lê e marca como lida as próprias.
DROP POLICY IF EXISTS "curso_notificacoes_select_aluno" ON curso_notificacoes;
CREATE POLICY "curso_notificacoes_select_aluno" ON curso_notificacoes FOR SELECT TO authenticated
  USING (destinatario_tipo = 'aluno' AND destinatario_id = my_aluno_id());
DROP POLICY IF EXISTS "curso_notificacoes_update_aluno" ON curso_notificacoes;
CREATE POLICY "curso_notificacoes_update_aluno" ON curso_notificacoes FOR UPDATE TO authenticated
  USING (destinatario_tipo = 'aluno' AND destinatario_id = my_aluno_id())
  WITH CHECK (destinatario_tipo = 'aluno' AND destinatario_id = my_aluno_id());

NOTIFY pgrst, 'reload schema';

-- =====================================================================
-- Verificação
-- =====================================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name LIKE 'curso%' OR table_name = 'cursos'
ORDER BY table_name;

SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename LIKE 'curso%' OR tablename = 'cursos'
ORDER BY tablename;

SELECT tablename, count(*) AS policies FROM pg_policies
WHERE tablename LIKE 'curso%' OR tablename = 'cursos'
GROUP BY tablename ORDER BY tablename;

SELECT proname FROM pg_proc WHERE proname = 'my_aluno_id';
