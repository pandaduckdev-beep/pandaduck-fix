import { useState, useRef, useEffect, memo } from 'react'

interface LazyImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width: number
  height: number
  rootMargin?: string
  fallback?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
}

/**
 * LazyImage - IntersectionObserver 기반 이미지 지연 로딩 컴포넌트
 *
 * iOS의 willDisplayCell처럼 이미지가 화면에 보이기 직전에 로딩을 시작합니다.
 * - rootMargin으로 미리 로드 시작 시점 조절 (기본 200px 전)
 * - 고정된 width/height로 레이아웃 시프트 방지
 * - Skeleton placeholder → fade-in 애니메이션
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  rootMargin = '200px 0px',
  fallback,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver로 뷰포트 진입 감지
  useEffect(() => {
    if (!containerRef.current || !src) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold: 0 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [src, rootMargin])

  // src가 없거나 에러 발생 시 fallback 표시
  if (!src || hasError) {
    return (
      <div
        className={`bg-[#E5E5E5] flex items-center justify-center flex-shrink-0 ${className}`}
        style={{ width, height }}
      >
        {fallback}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden flex-shrink-0 ${className}`}
      style={{ width, height }}
    >
      {/* Skeleton Placeholder */}
      <div
        className={`absolute inset-0 bg-[#E5E5E5] transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'
        }`}
      />

      {/* Actual Image - 뷰포트 진입 시에만 로드 */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => {
            setIsLoaded(true)
            onLoad?.()
          }}
          onError={() => {
            setHasError(true)
            onError?.()
          }}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  )
})
