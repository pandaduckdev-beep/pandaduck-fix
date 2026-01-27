import { supabase } from './supabase'
import { nanoid } from 'nanoid'

export async function generateReviewToken(repairRequestId: string): Promise<string> {
  const token = nanoid(32)

  const { error } = await supabase
    .from('repair_requests')
    .update({
      review_token: token,
      review_sent_at: new Date().toISOString()
    })
    .eq('id', repairRequestId)

  if (error) throw error

  return token
}

export function getReviewUrl(token: string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/review/${token}`
}

export function maskName(name: string): string {
  if (name.length === 2) {
    return name[0] + '*'
  }
  if (name.length === 3) {
    return name[0] + '*' + name[2]
  }
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
    document.body.removeChild(textArea)
  }
}

export function openKakaoTalk(url: string, customerName: string) {
  // 카카오톡 공유하기 기능 (실제 구현 시 카카오 SDK 필요)
  const message = `안녕하세요 ${customerName}님 👋\n\n서비스 어떠셨는지, 편하게 리뷰 남겨주시면\n앞으로 더 좋은 서비스 제공하도록 노력할게요! 💪✨\n\n감사합니다! 🙏\n\n${url}`

  // 임시로 클립보드에 복사
  copyToClipboard(message)
  alert('리뷰 요청 메시지가 클립보드에 복사되었습니다.\n카카오톡에서 붙여넣기 해주세요.')
}
