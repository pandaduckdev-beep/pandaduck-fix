const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const BUCKET = 'repair-log-images'

function loadEnv() {
  const env = { ...process.env }

  if (fs.existsSync('.env')) {
    const lines = fs.readFileSync('.env', 'utf8').split(/\n+/).filter(Boolean)
    for (const line of lines) {
      const idx = line.indexOf('=')
      if (idx <= 0) continue
      const key = line.slice(0, idx)
      const value = line.slice(idx + 1)
      if (!env[key]) env[key] = value
    }
  }

  return env
}

function parseArgs() {
  const args = process.argv.slice(2)
  return {
    dryRun: args.includes('--dry-run'),
    limit: Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || 0) || undefined,
  }
}

function parseDataUri(dataUri) {
  const match = dataUri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null

  return {
    mimeType: match[1],
    base64: match[2],
  }
}

function extFromMime(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  if (mimeType === 'image/gif') return 'gif'
  return 'bin'
}

async function ensureBucket(supabase) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) throw listError

  const exists = (buckets || []).some((b) => b.id === BUCKET)
  if (exists) return

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })

  if (createError) throw createError
}

async function fetchTargets(supabase, limit) {
  let query = supabase
    .from('repair_logs')
    .select('id,thumbnail_url')
    .like('thumbnail_url', 'data:image%')
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

async function run() {
  const { dryRun, limit } = parseArgs()
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('VITE_SUPABASE_URL is required')
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to run this migration script')
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  await ensureBucket(supabase)

  const targets = await fetchTargets(supabase, limit)
  console.log(`Found ${targets.length} base64 thumbnails`)

  let successCount = 0
  let failCount = 0

  for (const row of targets) {
    try {
      const parsed = parseDataUri(row.thumbnail_url || '')
      if (!parsed) {
        failCount += 1
        continue
      }

      const ext = extFromMime(parsed.mimeType)
      const path = `thumbnails/${row.id}.${ext}`
      const bytes = Buffer.from(parsed.base64, 'base64')

      if (!dryRun) {
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, bytes, { contentType: parsed.mimeType, upsert: true })
        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path)
        const { error: updateError } = await supabase
          .from('repair_logs')
          .update({ thumbnail_url: publicData.publicUrl })
          .eq('id', row.id)
        if (updateError) throw updateError
      }

      successCount += 1
      console.log(`${dryRun ? '[dry-run] ' : ''}migrated ${row.id}`)
    } catch (error) {
      failCount += 1
      console.error(`Failed ${row.id}: ${error.message || error}`)
    }
  }

  console.log(
    JSON.stringify({ dryRun, targetCount: targets.length, successCount, failCount }, null, 2)
  )
}

run().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
