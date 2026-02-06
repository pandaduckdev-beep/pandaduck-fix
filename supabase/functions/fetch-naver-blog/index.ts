import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 네이버 블로그 페이지 스크래핑
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // 네이버 블로그 본문 추출 (여러 가능한 셀렉터 시도)
    const contentPatterns = [
      /<div class="se-main-container">([\s\S]*?)<\/div>\s*<div class="se-list-series/,
      /<div class="se-main-container">([\s\S]*?)<\/div>\s*<!--\s*$/,
      /<article[^>]*class="[^"]*se-document[^"]*"[\s\S]*?<\/article>/,
      /<div id="postViewArea"[\s\S]*?<\/div>/
    ]

    let content = ''
    for (const pattern of contentPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        content = match[0] // 전체 매치된 HTML 사용
        break
      } else if (match && match[0]) {
        content = match[0]
        break
      }
    }

    // 본문이 없으면 전체 HTML에서 본문 영역 추출 시도
    if (!content) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)
      if (bodyMatch) {
        content = bodyMatch[1]
      }
    }

    // 이미지 추출
    const images: string[] = []
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi
    let match
    const seenImages = new Set<string>()

    // 본문에서 이미지 추출
    while ((match = imgRegex.exec(content)) !== null) {
      if (match[1]) {
        let imgSrc = match[1]

        // 상대 경로를 절대 경로로 변환
        if (imgSrc.startsWith('//')) {
          imgSrc = 'https:' + imgSrc
        } else if (imgSrc.startsWith('/')) {
          const urlObj = new URL(url)
          imgSrc = `${urlObj.protocol}//${urlObj.host}${imgSrc}`
        }

        // 중복 제거 및 네이버 이미지 필터링
        if (!seenImages.has(imgSrc) &&
            (imgSrc.includes('postfiles') ||
             imgSrc.includes('blogfiles') ||
             imgSrc.includes('phinf'))) {
          seenImages.add(imgSrc)
          images.push(imgSrc)
        }
      }
    }

    // HTML 정제 (스크립트, 스타일 등 제거)
    let cleanContent = content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<!--.*?-->/g, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<div class="[^"]*Translator[^"]*"[^>]*>.*?<\/div>/gi, '')

    return new Response(
      JSON.stringify({
        content: cleanContent,
        images: images,
        firstImage: images.length > 0 ? images[0] : null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
