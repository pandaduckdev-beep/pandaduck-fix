import { ImageResponse } from '@vercel/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 128,
            background: 'linear-gradient(to bottom, #000000, #1a1a1a)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div style={{ marginBottom: 40 }}>🎮</div>
          <div>PandaDuck Fix</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }

  try {
    // 작업기 데이터 조회
    const { data: log } = await supabase
      .from('repair_logs')
      .select('*')
      .eq('id', id)
      .single()

    if (!log) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 48,
              background: 'linear-gradient(to bottom, #000000, #1a1a1a)',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              padding: 60,
            }}
          >
            <div>작업기를 찾을 수 없습니다</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      )
    }

    // 본문에서 첫 번째 이미지 추출
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i
    const match = log.content.match(imgRegex)
    const imageUrl = match ? match[1] : null

    // 본문 텍스트 추출 (HTML 태그 제거)
    const plainText = log.content
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .slice(0, 150)

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom, #000000, #1a1a1a)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 60,
            color: 'white',
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 40,
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              paddingBottom: 20,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                marginRight: 20,
              }}
            >
              🎮
            </div>
            <div>
              <div style={{ fontSize: 20, opacity: 0.8 }}>PandaDuck Fix</div>
              <div style={{ fontSize: 14, opacity: 0.6 }}>수리 작업기</div>
            </div>
          </div>

          {/* 썸네일 이미지 */}
          {imageUrl && (
            <div
              style={{
                width: '100%',
                height: 300,
                marginBottom: 30,
                borderRadius: 16,
                overflow: 'hidden',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}

          {/* 제목 */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            {log.title}
          </div>

          {/* 컨트롤러 모델 */}
          {log.controller_model && (
            <div
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 24,
                marginBottom: 20,
              }}
            >
              🕹️ {log.controller_model}
            </div>
          )}

          {/* 본문 요약 */}
          {plainText && (
            <div
              style={{
                fontSize: 28,
                opacity: 0.8,
                lineHeight: 1.4,
              }}
            >
              {plainText}...
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom, #000000, #1a1a1a)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div>PandaDuck Fix</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}
