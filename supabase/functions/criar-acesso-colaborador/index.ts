// Supabase Edge Function — Criar/Atualizar Acesso do Colaborador
// Cria (ou atualiza) a conta de Supabase Auth de um colaborador, pra login
// por USUÁRIO + SENHA (sem e-mail) — mesmo padrão de criar-acesso-aluno:
// nunca roda signUp() no client (trocaria a sessão ativa da dona), nunca
// manda e-mail de confirmação. A diferença é que aqui não existe e-mail
// real — "usuario" vira um e-mail interno só pra existir no Supabase Auth
// (usuario@flora.local), único GLOBALMENTE (decisão explícita: login.html
// é uma página só, compartilhada por todos os salões, sem jeito de saber
// de antemão "de qual salão" é um usuário digitado sem e-mail).
//
// Variáveis de ambiente:
//   SUPABASE_URL              — injetado automaticamente pelo Supabase
//   SUPABASE_ANON_KEY          — injetado automaticamente pelo Supabase
//   APP_SERVICE_ROLE_KEY       — secret próprio, se configurado
//   SUPABASE_SERVICE_ROLE_KEY  — injetado automaticamente pelo Supabase;
//     usado como fallback quando APP_SERVICE_ROLE_KEY não está configurado,
//     pra não depender de criar um secret manualmente.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EMAIL_DOMAIN = 'flora.local';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// Normaliza pra um "usuario" válido como local-part de e-mail: minúsculas,
// sem acento, só [a-z0-9._-], sem espaço.
function normalizarUsuario(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos (marcas de combinação pós-NFD)
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  // ── Verificar JWT de quem chamou (precisa ser a dona do salão, logada) ──
  const authHeader = req.headers.get('authorization') ?? '';
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  // ── Confirmar que quem chamou é a DONA do salão, não um colaborador
  //    qualquer. Depois da migration de login por usuário, my_salao_id()
  //    também resolve pra colaboradores autenticados — então só confiar na
  //    RLS de colaboradores (mais abaixo) não bastava: um colaborador do
  //    mesmo salão conseguiria criar/trocar o acesso de um colega.
  const { data: dono } = await supabaseAuth.from('saloes').select('id').eq('id', user.id).maybeSingle();
  let ehDono = !!dono;
  if (!ehDono && user.email) {
    const { data: donoPorEmail } = await supabaseAuth.from('saloes').select('id').eq('email', user.email).maybeSingle();
    ehDono = !!donoPorEmail;
  }
  if (!ehDono) return json({ error: 'Apenas a administração do salão pode criar acesso de colaborador.' }, 403);

  let body: { colaborador_id?: number | string; usuario?: string; senha?: string };
  try { body = await req.json(); } catch { return json({ error: 'Bad Request' }, 400); }
  const colaboradorId = body.colaborador_id;
  const usuario = body.usuario ? normalizarUsuario(body.usuario) : '';
  const senha = body.senha?.trim() || undefined;

  if (!colaboradorId) return json({ error: 'colaborador_id é obrigatório' }, 400);
  if (!usuario) return json({ error: 'Informe um nome de usuário válido.' }, 400);
  if (usuario.length < 3) return json({ error: 'O usuário precisa ter pelo menos 3 caracteres.' }, 400);
  if (senha && senha.length < 6) return json({ error: 'A senha precisa ter pelo menos 6 caracteres.' }, 400);

  // ── Confirmar que o colaborador pertence ao salão de quem chamou, usando
  //    o client com o JWT do chamador — a RLS existente (salao_id =
  //    my_salao_id()) já garante isso: se não pertencer, a leitura retorna
  //    0 linhas.
  const { data: colab, error: colabErr } = await supabaseAuth
    .from('colaboradores')
    .select('id, nome, usuario, auth_user_id, salao_id')
    .eq('id', colaboradorId)
    .single();
  if (colabErr || !colab) return json({ error: 'Colaborador não encontrado ou sem permissão' }, 404);

  // ── Cliente com service role — única parte que efetivamente cria/edita a conta ──
  const serviceRoleKey = Deno.env.get('APP_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    serviceRoleKey!,
  );

  // ── Usuário único GLOBALMENTE — checa antes de chamar o Auth, pra dar
  //    uma mensagem clara em vez do erro genérico de constraint.
  if (!colab.usuario || colab.usuario.toLowerCase() !== usuario) {
    const { data: emUso } = await supabaseAdmin
      .from('colaboradores')
      .select('id')
      .ilike('usuario', usuario)
      .neq('id', colaboradorId)
      .maybeSingle();
    if (emUso) return json({ error: 'Esse nome de usuário já está em uso. Escolha outro.' }, 409);
  }

  const emailInterno = `${usuario}@${EMAIL_DOMAIN}`;

  try {
    if (colab.auth_user_id) {
      // ── Já tem conta — atualiza usuário (e-mail interno)/senha ──
      const patch: Record<string, unknown> = {};
      if (colab.usuario?.toLowerCase() !== usuario) patch.email = emailInterno;
      if (senha) patch.password = senha;
      if (Object.keys(patch).length > 0) {
        const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(colab.auth_user_id, patch);
        if (updErr) throw updErr;
      }
      const { error: updColabErr } = await supabaseAdmin
        .from('colaboradores')
        .update({ usuario })
        .eq('id', colaboradorId);
      if (updColabErr) throw updColabErr;

      console.log('[criar-acesso-colaborador] acesso atualizado:', colab.auth_user_id, 'para colaborador', colaboradorId);
      return json({ auth_user_id: colab.auth_user_id, usuario });
    }

    // ── Conta nova — precisa de senha ──
    if (!senha) return json({ error: 'Defina uma senha pra criar o acesso.' }, 400);

    const { data: resultado, error: criarErr } = await supabaseAdmin.auth.admin.createUser({
      email: emailInterno,
      password: senha,
      email_confirm: true,
      user_metadata: { nome: colab.nome, tipo_conta: 'colaborador', usuario },
    });
    if (criarErr || !resultado?.user) throw criarErr ?? new Error('Falha ao criar acesso do colaborador');

    const { error: updColabErr } = await supabaseAdmin
      .from('colaboradores')
      .update({ usuario, auth_user_id: resultado.user.id })
      .eq('id', colaboradorId);
    if (updColabErr) throw updColabErr;

    console.log('[criar-acesso-colaborador] conta criada:', resultado.user.id, 'para colaborador', colaboradorId);
    return json({ auth_user_id: resultado.user.id, usuario });
  } catch (e) {
    console.error('[criar-acesso-colaborador] erro:', e);
    const msg = e instanceof Error ? e.message : String(e);
    const jaRegistrado = /already.*registered/i.test(msg);
    return json({
      error: jaRegistrado ? 'Esse nome de usuário já está em uso. Escolha outro.' : msg,
    }, jaRegistrado ? 409 : 500);
  }
});
