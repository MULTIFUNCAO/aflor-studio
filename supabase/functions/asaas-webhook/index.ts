// Supabase Edge Function — ASAAS Webhook
// Recebe notificações do ASAAS e atualiza saloes.plano automaticamente.
//
// Variáveis de ambiente necessárias (Supabase → Settings → Edge Functions):
//   ASAAS_WEBHOOK_TOKEN  — token configurado no painel ASAAS (Configurações → Webhooks)
//   ASAAS_API_KEY        — access_token da conta ASAAS (para buscar email do cliente)
//   SUPABASE_URL         — injetado automaticamente pelo Supabase
//   SUPABASE_SERVICE_ROLE_KEY — injetado automaticamente pelo Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Mapeamento valor ASAAS → nome do plano no banco
const PLANO_POR_VALOR: [number, string][] = [
  [29.90, 'inicial'],
  [49.00, 'profissional'],
  [97.00, 'flora_total'],
];

function mapValorPlano(valor: number): string {
  for (const [v, plano] of PLANO_POR_VALOR) {
    if (Math.abs(valor - v) < 0.50) return plano;
  }
  return 'profissional';
}

// Eventos que confirmam pagamento
const EVENTOS_OK = new Set([
  'PAYMENT_CONFIRMED',
  'PAYMENT_RECEIVED',
  'SUBSCRIPTION_ACTIVATED',
]);

// Eventos que cancelam / expiram assinatura
const EVENTOS_CANCEL = new Set([
  'SUBSCRIPTION_DELETED',
  'PAYMENT_OVERDUE',
]);

serve(async (req: Request) => {
  // ASAAS sempre envia POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // ── Verificar token do webhook ──────────────────────────────────────────
  const webhookToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN');
  if (webhookToken) {
    const incomingToken = req.headers.get('asaas-access-token');
    if (incomingToken !== webhookToken) {
      console.error('Token inválido:', incomingToken);
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // ── Ler payload ─────────────────────────────────────────────────────────
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const event = payload.event as string;
  const payment = payload.payment as Record<string, unknown> | undefined;

  console.log(`[asaas-webhook] event=${event} payment=${JSON.stringify(payment?.id)}`);

  if (!payment) {
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Cliente Supabase com service role (ignora RLS) ──────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const externalRef = payment.externalReference as string | null;
  const valor = parseFloat(String(payment.value ?? 0));

  // ── Pagamento confirmado ────────────────────────────────────────────────
  if (EVENTOS_OK.has(event)) {
    const plano = mapValorPlano(valor);
    const updates = {
      plano,
      assinatura_id: (payment.subscription ?? payment.id) as string,
      plano_ativo_desde: new Date().toISOString(),
    };

    // Caminho 1: externalReference = salao_id (fluxo dinâmico)
    if (externalRef) {
      const { error } = await supabase
        .from('saloes')
        .update(updates)
        .eq('id', externalRef);

      if (error) console.error('[webhook] update by id error:', error);
      else console.log(`[webhook] plano ${plano} ativado para salao ${externalRef}`);

      return new Response(JSON.stringify({ received: true, plano }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Caminho 2: sem externalReference → buscar email do cliente no ASAAS
    const apiKey = Deno.env.get('ASAAS_API_KEY');
    const customerId = payment.customer as string | undefined;

    if (apiKey && customerId) {
      try {
        const resp = await fetch(
          `https://www.asaas.com/api/v3/customers/${customerId}`,
          { headers: { 'access_token': apiKey } },
        );
        const customer = await resp.json();
        const email = customer.email as string | undefined;

        if (email) {
          const { error } = await supabase
            .from('saloes')
            .update(updates)
            .eq('email', email);

          if (error) console.error('[webhook] update by email error:', error);
          else console.log(`[webhook] plano ${plano} ativado para email ${email}`);
        } else {
          console.error('[webhook] customer sem email:', customer);
        }
      } catch (e) {
        console.error('[webhook] erro ao buscar customer ASAAS:', e);
      }
    } else {
      console.warn('[webhook] sem externalRef e sem ASAAS_API_KEY — não foi possível identificar o salão');
    }
  }

  // ── Assinatura cancelada / inadimplência ────────────────────────────────
  if (EVENTOS_CANCEL.has(event)) {
    if (externalRef) {
      const { error } = await supabase
        .from('saloes')
        .update({ plano: 'trial', assinatura_id: null })
        .eq('id', externalRef);

      if (error) console.error('[webhook] downgrade error:', error);
      else console.log(`[webhook] plano rebaixado para trial: salao ${externalRef}`);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
