// Supabase Edge Function — Criar Acesso do Aluno
// Cria a conta de Supabase Auth de um aluno (curso_alunos) e envia o
// e-mail de convite para ele definir a própria senha, sem nunca rodar
// signUp() no client (que trocaria a sessão ativa do dono do salão).
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

  let body: { aluno_id?: string };
  try { body = await req.json(); } catch { return json({ error: 'Bad Request' }, 400); }
  const alunoId = body.aluno_id;
  if (!alunoId) return json({ error: 'aluno_id é obrigatório' }, 400);

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
    const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      aluno.email,
      { data: { nome: aluno.nome, tipo_conta: 'aluno' } },
    );
    if (inviteErr || !invited?.user) {
      throw inviteErr ?? new Error('Falha ao convidar aluno');
    }

    const { error: updateErr } = await supabaseAdmin
      .from('curso_alunos')
      .update({ auth_user_id: invited.user.id })
      .eq('id', alunoId);
    if (updateErr) throw updateErr;

    console.log('[criar-acesso-aluno] conta criada:', invited.user.id, 'para aluno', alunoId);
    return json({ auth_user_id: invited.user.id, email: aluno.email });
  } catch (e) {
    console.error('[criar-acesso-aluno] erro:', e);
    return json({ error: String(e) }, 500);
  }
});
