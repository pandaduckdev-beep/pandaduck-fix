import { supabase } from '@/lib/supabase'

const PRIMARY_BUCKET_NAME = 'service-images'
const FALLBACK_BUCKET_NAME = 'repair-log-images'

const parseDataUri = (dataUri: string) => {
  const match = dataUri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null

  return {
    mimeType: match[1],
    base64: match[2],
  }
}

const extensionFromMime = (mimeType: string) => {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  if (mimeType === 'image/gif') return 'gif'
  return 'bin'
}

const base64ToBytes = (base64: string) => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export const resolveRepairLogThumbnailUrl = async (
  source: string | null,
  logIdHint?: string
): Promise<string | null> => {
  if (!source) return null
  if (source.startsWith('http://') || source.startsWith('https://')) return source
  if (!source.startsWith('data:image')) return null

  const parsed = parseDataUri(source)
  if (!parsed) return null

  const ext = extensionFromMime(parsed.mimeType)
  const timestamp = Date.now()
  const safeHint = (logIdHint || 'repair-log').replace(/[^a-zA-Z0-9_-]/g, '')
  const path = `thumbnails/${safeHint}-${timestamp}.${ext}`
  const bytes = base64ToBytes(parsed.base64)

  const bucketCandidates = [PRIMARY_BUCKET_NAME, FALLBACK_BUCKET_NAME]
  let lastError: unknown = null

  for (const bucket of bucketCandidates) {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, bytes, { contentType: parsed.mimeType, upsert: true })

    if (!uploadError) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    }

    lastError = uploadError
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to upload repair log thumbnail to storage buckets')
}
