// Supabase Edge Function — Criar Acesso do Aluno
// Cria a conta de Supabase Auth de um aluno (curso_alunos), sem nunca rodar
// signUp() no client (que trocaria a sessão ativa do dono do salão).
//
// Dois modos, escolhidos pelo admin na Ficha do Aluno:
//   - senha_provisoria preenchida: cria a conta já com essa senha
//     (auth.admin.createUser, email_confirm:true), SEM enviar e-mail nenhum —
//     pensado pro admin repassar login/senha por WhatsApp enquanto o limite
//     de e-mail do Supabase (serviço padrão, sem SMTP próprio) estiver
//     travando os convites. must_change_password:true no user_metadata força
//     o Portal a pedir troca de senha no primeiro acesso.
//   - sem senha_provisoria: fluxo de sempre, inviteUserByEmail (convite real
//     por e-mail) — pra quando um SMTP próprio estiver configurado.
//
// Variáveis de ambiente:
//   SUPABASE_URL         — injetado automaticamente pelo Supabase
//   SUPABASE_ANON_KEY     — injetado automaticamente pelo Supabase
//   APP_SERVICE_ROLE_KEY — injetado automaticamente pelo Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  // ── Verificar JWT de quem chamou (precisa ser o dono/colaborador logado) ──
  const authHeader = req.headers.get('authorization') ?? '';
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  let body: { aluno_id?: string; senha_provisoria?: string };
  try { body = await req.json(); } catch { return json({ error: 'Bad Request' }, 400); }
  const alunoId = body.aluno_id;
  const senhaProvisoria = body.senha_provisoria?.trim() || undefined;
  if (!alunoId) return json({ error: 'aluno_id é obrigatório' }, 400);
  if (senhaProvisoria && senhaProvisoria.length < 8) {
    return json({ error: 'A senha provisória precisa ter pelo menos 8 caracteres.' }, 400);
  }

  // ── Confirmar que o aluno pertence ao salão de quem chamou, usando o
  //    client com o JWT do chamador — a RLS existente (salao_id = my_salao_id())
  //    já garante isso: se não pertencer, a leitura retorna 0 linhas.
  const { data: aluno, error: alunoErr } = await supabaseAuth
    .from('curso_alunos')
    .select('id, nome, email, auth_user_id, salao_id')
    .eq('id', alunoId)
    .single();
  if (alunoErr || !aluno) return json({ error: 'Aluno não encontrado ou sem permissão' }, 404);
  if (!aluno.email) return json({ error: 'Aluno não tem e-mail cadastrado' }, 400);
  if (aluno.auth_user_id) return json({ error: 'Aluno já tem acesso criado', auth_user_id: aluno.auth_user_id }, 409);

  // ── Cliente com service role — única parte que efetivamente cria a conta ──
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('APP_SERVICE_ROLE_KEY')!,
  );

  try {
    const { data: resultado, error: criarErr } = senhaProvisoria
      ? await supabaseAdmin.auth.admin.createUser({
          email: aluno.email,
          password: senhaProvisoria,
          email_confirm: true,
          user_metadata: { nome: aluno.nome, tipo_conta: 'aluno', must_change_password: true },
        })
      : await supabaseAdmin.auth.admin.inviteUserByEmail(
          aluno.email,
          {
            data: { nome: aluno.nome, tipo_conta: 'aluno' },
            // Sem isso o convite cai no Site URL padrão do projeto (o painel do
            // salão, index.html) em vez do Portal do Aluno. index.html também
            // tem um guard que redireciona sessões de aluno pra cá como segunda
            // camada — mas o link já apontar certo evita o hop extra.
            redirectTo: 'https://floragestao.com.br/portal-aluno.html',
          },
        );

    if (criarErr || !resultado?.user) {
      const jaRegistrado = /already.*registered/i.test(criarErr?.message ?? '');
      if (!jaRegistrado) throw criarErr ?? new Error('Falha ao criar acesso do aluno');

      // ── E-mail já tem conta em auth.users (comum: aluna já é aluna/cliente
      //    deste MESMO salão em outro curso/contexto) — vincula em vez de
      //    falhar, sem reenviar nenhum e-mail.
      //
      //    IMPORTANTE: auth.users é compartilhado por TODOS os salões deste
      //    projeto Supabase (multi-tenant) — "e-mail já existe" não garante
      //    que é a mesma pessoa deste salão. Duas proteções antes de vincular:
      //    1) nunca vincular se o e-mail for a conta de LOGIN de uma dona de
      //       salão (saloes.id = auth.uid() dela);
      //    2) curso_alunos.auth_user_id tem UNIQUE — se esse usuário já for
      //       aluno em QUALQUER outro salão, o UPDATE abaixo falha sozinho
      //       por violação de unicidade, e tratamos isso como erro amigável
      //       em vez de deixar estourar.
      const { data: listaUsuarios, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listErr) throw listErr;
      const existente = listaUsuarios.users.find(
        (u) => u.email?.toLowerCase() === aluno.email!.toLowerCase(),
      );
      if (!existente) {
        return json({
          error: 'Já existe uma conta com este e-mail, mas não consegui localizá-la pra vincular. Fale com o suporte.',
        }, 409);
      }

      const { data: donaSalao } = await supabaseAdmin
        .from('saloes')
        .select('id')
        .eq('id', existente.id)
        .maybeSingle();
      if (donaSalao) {
        return json({
          error: 'Este e-mail já é a conta de login de uma dona de salão no sistema — não é possível vincular como aluno. Peça pra aluna usar outro e-mail.',
        }, 409);
      }

      const { error: updateErr } = await supabaseAdmin
        .from('curso_alunos')
        .update({ auth_user_id: existente.id })
        .eq('id', alunoId);
      if (updateErr) {
        const duplicado = /duplicate key|unique constraint/i.test(updateErr.message ?? '');
        return json({
          error: duplicado
            ? 'Este e-mail já é de uma aluna com acesso em outro salão no sistema — não é possível vincular aqui. Peça pra ela usar outro e-mail.'
            : updateErr.message,
        }, 409);
      }

      console.log('[criar-acesso-aluno] vinculado a conta já existente:', existente.id, 'para aluno', alunoId);
      return json({ auth_user_id: existente.id, email: aluno.email, vinculado_existente: true });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('curso_alunos')
      .update({ auth_user_id: resultado.user.id })
      .eq('id', alunoId);
    if (updateErr) throw updateErr;

    console.log(
      '[criar-acesso-aluno] conta criada:', resultado.user.id, 'para aluno', alunoId,
      senhaProvisoria ? '(senha provisória, sem e-mail)' : '(convite por e-mail)',
    );
    return json({
      auth_user_id: resultado.user.id,
      email: aluno.email,
      ...(senhaProvisoria ? { senha_provisoria: senhaProvisoria } : {}),
    });
  } catch (e) {
    console.error('[criar-acesso-aluno] erro:', e);
    const msg = e instanceof Error ? e.message : String(e);
    const isRateLimit = /rate limit/i.test(msg);
    return json({
      error: isRateLimit
        ? 'Limite de envio de e-mail do Supabase excedido. Configure um provedor SMTP customizado (Authentication → Settings → SMTP Settings) ou tente novamente mais tarde.'
        : msg,
    }, 500);
  }
});
