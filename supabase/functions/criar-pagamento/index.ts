// Supabase Edge Function — Criar Pagamento ASAAS
// Cria assinatura mensal no ASAAS com externalReference = salao_id,
// retorna a URL de pagamento personalizada.
//
// Variáveis de ambiente:
//   ASAAS_API_KEY  — access_token da conta ASAAS
//   SUPABASE_URL / SUPABASE_ANON_KEY — injetados automaticamente

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PLANOS: Record<string, { valor: number; nome: string; linkFallback: string }> = {
  inicial: {
    valor: 29.90,
    nome: 'Flora Gestão — Plano Inicial',
    linkFallback: 'https://www.asaas.com/c/fajbuzh4yw2oc1kx',
  },
  profissional: {
    valor: 49.00,
    nome: 'Flora Gestão — Plano Profissional',
    linkFallback: 'https://www.asaas.com/c/eb9459mfmxfq3smr',
  },
  flora_total: {
    valor: 97.00,
    nome: 'Flora Gestão — Flora Total',
    linkFallback: 'https://www.asaas.com/c/zi98kys7r7b4zt4w',
  },
};

const ASAAS = 'https://www.asaas.com/api/v3';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405);

  // ── Verificar JWT do usuário logado ─────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? '';
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authErr } = await supabaseAuth.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  // ── Ler body ─────────────────────────────────────────────────────────────
  let body: { plano?: string; salao_id?: string; nome?: string; email?: string };
  try { body = await req.json(); } catch { return json({ error: 'Bad Request' }, 400); }

  const { plano = 'profissional', salao_id, nome, email } = body;
  const cfg = PLANOS[plano];
  if (!cfg) return json({ error: 'Plano inválido' }, 400);

  const apiKey = Deno.env.get('ASAAS_API_KEY');

  // ── Sem API key: usar link estático como fallback ─────────────────────────
  if (!apiKey) {
    console.warn('[criar-pagamento] ASAAS_API_KEY não configurada — usando link estático');
    return json({ paymentUrl: cfg.linkFallback, fallback: true });
  }

  const customerEmail = email ?? user.email ?? '';
  const customerName  = nome  ?? customerEmail;

  try {
    // ── 1. Buscar ou criar cliente no ASAAS ──────────────────────────────
    let customerId: string;
    const searchResp = await fetch(
      `${ASAAS}/customers?email=${encodeURIComponent(customerEmail)}&limit=1`,
      { headers: { 'access_token': apiKey } },
    );
    const searchData = await searchResp.json();

    if (searchData.data?.length > 0) {
      customerId = searchData.data[0].id;
      console.log('[criar-pagamento] cliente existente:', customerId);
    } else {
      const createResp = await fetch(`${ASAAS}/customers`, {
        method: 'POST',
        headers: { 'access_token': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customerName, email: customerEmail }),
      });
      const created = await createResp.json();
      if (!created.id) throw new Error('Falha ao criar cliente ASAAS: ' + JSON.stringify(created));
      customerId = created.id;
      console.log('[criar-pagamento] cliente criado:', customerId);
    }

    // ── 2. Criar assinatura mensal com externalReference = salao_id ───────
    const nextDueDate = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
    const subResp = await fetch(`${ASAAS}/subscriptions`, {
      method: 'POST',
      headers: { 'access_token': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED',       // aceita cartão, PIX, boleto
        value: cfg.valor,
        nextDueDate,
        cycle: 'MONTHLY',
        description: cfg.nome,
        externalReference: salao_id ?? user.id,
        redirectTo: 'https://floragestao.com.br/?plano_ativado=1',
      }),
    });
    const sub = await subResp.json();
    if (!sub.id) throw new Error('Falha ao criar assinatura: ' + JSON.stringify(sub));
    console.log('[criar-pagamento] assinatura criada:', sub.id);

    // ── 3. Pegar URL de pagamento da primeira cobrança ────────────────────
    const invoicesResp = await fetch(
      `${ASAAS}/payments?subscription=${sub.id}&limit=1`,
      { headers: { 'access_token': apiKey } },
    );
    const invoices = await invoicesResp.json();
    const paymentUrl: string = invoices.data?.[0]?.invoiceUrl ?? cfg.linkFallback;

    return json({ paymentUrl, subscriptionId: sub.id });

  } catch (e) {
    console.error('[criar-pagamento] erro:', e);
    // Fallback gracioso para link estático
    return json({ paymentUrl: cfg.linkFallback, fallback: true, error: String(e) });
  }
});
