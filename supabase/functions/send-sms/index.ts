import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { corsHeaders } from '../_shared/cors.ts'

type MessageStage =
  | 'received'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'shipped'
  | 'review_request'

interface SendSmsRequest {
  repairRequestId?: string
  stage: MessageStage
  channel?: 'sms' | 'kakao'
  recipient: string
  message: string
}

const STAGES: MessageStage[] = [
  'received',
  'confirmed',
  'in_progress',
  'completed',
  'shipped',
  'review_request',
]

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function randomSalt(length = 32): string {
  const alphabet = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const random = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(random)
    .map((value) => alphabet[value % alphabet.length])
    .join('')
}

async function signHmacSha256(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return toHex(new Uint8Array(signature))
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('82') && digits.length >= 11) {
    return `0${digits.slice(2)}`
  }
  return digits
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const solapiApiKey = Deno.env.get('SOLAPI_API_KEY')
  const solapiApiSecret = Deno.env.get('SOLAPI_API_SECRET')
  const solapiSender = Deno.env.get('SOLAPI_SENDER')

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: 'Supabase service role environment is missing' })
  }

  const db = createClient(supabaseUrl, serviceRoleKey)

  let body: SendSmsRequest
  try {
    body = (await req.json()) as SendSmsRequest
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' })
  }

  const channel = body.channel ?? 'sms'
  const stage = body.stage
  const recipient = normalizePhone(body.recipient ?? '')
  const message = String(body.message ?? '').trim()
  const repairRequestId = body.repairRequestId ?? null

  if (!STAGES.includes(stage)) {
    return jsonResponse(400, { error: 'Invalid stage value' })
  }

  if (channel !== 'sms') {
    return jsonResponse(400, { error: 'Only sms channel is currently supported' })
  }

  if (!recipient || recipient.length < 10 || recipient.length > 12) {
    return jsonResponse(400, { error: 'Invalid recipient phone number' })
  }

  if (!message) {
    return jsonResponse(400, { error: 'Message is required' })
  }

  if (!solapiApiKey || !solapiApiSecret || !solapiSender) {
    return jsonResponse(500, {
      error: 'SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER must be configured',
    })
  }

  const sender = normalizePhone(solapiSender)
  if (!sender) {
    return jsonResponse(500, { error: 'Invalid SOLAPI_SENDER format' })
  }

  const duplicateSince = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const duplicateCheckQuery = db
    .from('message_dispatch_logs')
    .select('id, created_at')
    .eq('stage', stage)
    .eq('channel', channel)
    .eq('recipient', recipient)
    .eq('message', message)
    .eq('status', 'success')
    .gte('created_at', duplicateSince)
    .order('created_at', { ascending: false })
    .limit(1)

  const duplicateCheck = repairRequestId
    ? duplicateCheckQuery.eq('repair_request_id', repairRequestId)
    : duplicateCheckQuery.is('repair_request_id', null)

  const { data: duplicateRows, error: duplicateError } = await duplicateCheck

  if (duplicateError) {
    return jsonResponse(500, {
      error: 'Failed duplicate check',
      detail: duplicateError.message,
    })
  }

  if (duplicateRows && duplicateRows.length > 0) {
    return jsonResponse(409, {
      error: 'Duplicate message blocked within 5 minutes',
      duplicateLogId: duplicateRows[0].id,
    })
  }

  const date = new Date().toISOString()
  const salt = randomSalt(32)
  const signature = await signHmacSha256(solapiApiSecret, `${date}${salt}`)
  const authorization = `HMAC-SHA256 apiKey=${solapiApiKey}, date=${date}, salt=${salt}, signature=${signature}`

  const payload = {
    messages: [
      {
        to: recipient,
        from: sender,
        text: message,
        autoTypeDetect: true,
      },
    ],
  }

  let providerStatus = 'failed'
  let providerResponse: unknown = null
  let providerMessageId: string | null = null
  let errorMessage: string | null = null

  try {
    const providerResult = await fetch('https://api.solapi.com/messages/v4/send-many/detail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      body: JSON.stringify(payload),
    })

    const rawText = await providerResult.text()
    try {
      providerResponse = rawText ? JSON.parse(rawText) : null
    } catch {
      providerResponse = { raw: rawText }
    }

    if (!providerResult.ok) {
      errorMessage = `SOLAPI ${providerResult.status}: ${safeStringify(providerResponse)}`
    } else {
      providerStatus = 'success'
      const responseObject = providerResponse as {
        messageId?: string
        messageList?: Array<{ messageId?: string }>
        groupInfo?: { groupId?: string }
      } | null
      providerMessageId =
        responseObject?.messageId ??
        responseObject?.messageList?.[0]?.messageId ??
        responseObject?.groupInfo?.groupId ??
        null
    }
  } catch (error) {
    errorMessage = `SOLAPI request failed: ${error instanceof Error ? error.message : String(error)}`
  }

  const { data: insertedLog, error: logInsertError } = await db
    .from('message_dispatch_logs')
    .insert({
      repair_request_id: repairRequestId,
      stage,
      channel,
      recipient,
      message,
      status: providerStatus,
      provider: 'solapi',
      provider_message_id: providerMessageId,
      provider_response: providerResponse,
      error_message: errorMessage,
    })
    .select('id')
    .single()

  if (logInsertError) {
    return jsonResponse(500, {
      error: 'Failed to write message dispatch log',
      detail: logInsertError.message,
      providerStatus,
      providerResponse,
    })
  }

  if (providerStatus !== 'success') {
    return jsonResponse(502, {
      success: false,
      error: errorMessage ?? 'Provider send failed',
      logId: insertedLog.id,
      providerResponse,
    })
  }

  return jsonResponse(200, {
    success: true,
    logId: insertedLog.id,
    provider: 'solapi',
    providerMessageId,
  })
})
