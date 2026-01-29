import { corsHeaders } from '../_shared/cors.ts'

interface TelegramMessage {
  type: 'repair_request' | 'review'
  data: Record<string, unknown>
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Telegram API error: ${response.status} - ${errorBody}`)
  }

  return response.json()
}

function formatRepairRequest(data: Record<string, unknown>): string {
  // Parse issue_description to extract address, conditions, and notes
  const parseIssueDescription = (description: string | null | undefined) => {
    if (!description) return { address: null, conditions: null, notes: null }
    const desc = String(description)
    const addressMatch = desc.match(/고객 주소:\s*(.+?)(?:\n|$)/)
    const conditionsMatch = desc.match(/상태:\s*\[(.+?)\]/)
    const notesMatch = desc.match(/요청사항:\s*(.+?)(?:\n|$)/)
    return {
      address: addressMatch ? addressMatch[1].trim() : null,
      conditions: conditionsMatch ? conditionsMatch[1].split(',').map((s: string) => s.trim()) : null,
      notes: notesMatch ? notesMatch[1].trim() : null,
    }
  }

  const { address, conditions, notes } = parseIssueDescription(data.issueDescription as string | null | undefined)

  const lines = [
    '<b>🔧 새 수리 신청이 들어왔습니다</b>',
    '',
    '<b>━━━ 고객 정보 ━━━</b>',
    `<b>성함:</b> ${data.customerName || '-'}`,
    `<b>연락처:</b> ${data.customerPhone || '-'}`,
  ]

  if (data.customerEmail) {
    lines.push(`<b>이메일:</b> ${data.customerEmail}`)
  }

  if (address) {
    lines.push(`<b>주소:</b> ${address}`)
  }

  lines.push(`<b>컨트롤러 모델:</b> ${data.controllerModelName || data.controllerModel || '-'}`)

  // Services section
  lines.push('')
  lines.push('<b>━━━ 수리 내역 ━━━</b>')

  if (data.services && Array.isArray(data.services)) {
    let servicesTotal = 0
    for (const svc of data.services as Array<Record<string, unknown>>) {
      const servicePrice = Number(svc.servicePrice || 0)
      const optionPrice = Number(svc.optionPrice || 0)
      servicesTotal += servicePrice + optionPrice

      lines.push(`<b>${svc.serviceName || svc.serviceId}</b> — ₩${servicePrice.toLocaleString('ko-KR')}`)

      if (svc.optionName && optionPrice > 0) {
        lines.push(`  └ ${svc.optionName} — +₩${optionPrice.toLocaleString('ko-KR')}`)
      }
    }

    // Calculate discount if any
    const totalAmount = Number(data.totalAmount || 0)
    const discount = servicesTotal - totalAmount

    if (discount > 0) {
      lines.push('')
      lines.push(`<b>할인:</b> -₩${discount.toLocaleString('ko-KR')}`)
    }
  }

  lines.push('')
  lines.push(`<b>총 금액:</b> ₩${Number(data.totalAmount || 0).toLocaleString('ko-KR')}`)

  // Controller condition section
  if (conditions || notes) {
    lines.push('')
    lines.push('<b>━━━ 컨트롤러 상태 ━━━</b>')

    if (conditions && conditions.length > 0) {
      lines.push('<b>현재 상태:</b>')
      for (const condition of conditions) {
        lines.push(`  • ${condition}`)
      }
    }

    if (notes) {
      if (conditions && conditions.length > 0) {
        lines.push('')
      }
      lines.push(`<b>추가 요청사항:</b> ${notes}`)
    }
  }

  return lines.join('\n')
}

function formatReview(data: Record<string, unknown>): string {
  const rating = Number(data.rating || 0)
  const stars = '⭐'.repeat(rating)

  return [
    '<b>💬 새 리뷰가 작성되었습니다</b>',
    '',
    `<b>고객명:</b> ${data.customerName || '-'}`,
    `<b>평점:</b> ${stars} (${rating}/5)`,
    `<b>서비스:</b> ${data.serviceName || '-'}`,
    '',
    `<b>후기:</b> ${data.content || '-'}`,
  ].join('\n')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

  if (!botToken || !chatId) {
    return new Response(
      JSON.stringify({ error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body: TelegramMessage = await req.json()

    let message: string

    switch (body.type) {
      case 'repair_request':
        message = formatRepairRequest(body.data)
        break
      case 'review':
        message = formatReview(body.data)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown notification type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    await sendTelegramMessage(botToken, chatId, message)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Telegram notification error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send notification', detail: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
