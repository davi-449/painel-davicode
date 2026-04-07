import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cliente_id } = await req.json()

    if (!cliente_id) {
      throw new Error('cliente_id é obrigatório')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Obter os dados do cliente
    const { data: cliente, error: clienteError } = await supabaseClient
      .from('clientes_crm')
      .select('*')
      .eq('id', cliente_id)
      .single()

    if (clienteError || !cliente) {
      throw new Error('Cliente não encontrado')
    }

    // 2. Obter a configuração da aplicação
    const { data: config, error: configError } = await supabaseClient
      .from('app_config')
      .select('n8n_webhook_url, assistant_prompt')
      .eq('id', 1)
      .single()

    const webhookUrl = config?.n8n_webhook_url || Deno.env.get('N8N_WEBHOOK_URL');

    if (!webhookUrl) {
      throw new Error('URL do Webhook do n8n não configurada.')
    }

    // 3. Disparar o webhook para o N8N
    const payload = {
        cliente_id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        status_funil: cliente.status_funil,
        prompt_customizado: config?.assistant_prompt || '',
        timestamp: new Date().toISOString()
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Falha ao disparar N8N: ${response.statusText}`)
    }

    // 4. Registrar atividade
    await supabaseClient.from('atividades').insert({
        cliente_id: cliente.id,
        tipo: 'system',
        descricao: 'Disparo manual para o n8n',
    })

    return new Response(JSON.stringify({ success: true, message: 'Disparo realizado com sucesso' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
