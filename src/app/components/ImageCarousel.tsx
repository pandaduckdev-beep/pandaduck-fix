import { useState, useEffect, useRef, useCallback } from 'react'
import { useSwipeable } from 'react-swipeable'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

export interface CarouselImage {
  url: string
  alt: string
  label?: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  initialIndex?: number
  onIndexChange?: (index: number) => void
  className?: string
}

export function ImageCarousel({
  images,
  initialIndex = 0,
  onIndexChange,
  className = '',
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([initialIndex]))
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const carouselRef = useRef<HTMLDivElement>(null)

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    const indicesToPreload = [
      currentIndex - 1,
      currentIndex,
      currentIndex + 1,
    ].filter((idx) => idx >= 0 && idx < images.length)

    indicesToPreload.forEach((idx) => {
      if (!loadedImages.has(idx) && !imageErrors.has(idx)) {
        const img = new Image()
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(idx))
        }
        img.onerror = () => {
          setImageErrors((prev) => new Set(prev).add(idx))
        }
        img.src = images[idx].url
      }
    })
  }, [currentIndex, images, loadedImages, imageErrors])

  // Navigate to specific index
  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index)
        onIndexChange?.(index)
      }
    },
    [images.length, onIndexChange]
  )

  // Navigate to previous image
  const goToPrevious = useCallback(() => {
    goToIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1)
  }, [currentIndex, images.length, goToIndex])

  // Navigate to next image
  const goToNext = useCallback(() => {
    goToIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1)
  }, [currentIndex, images.length, goToIndex])

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true,
  })

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          goToPrevious()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          goToNext()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setIsLightboxOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, goToPrevious, goToNext])

  // Handle image load error
  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index))
  }

  if (images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]
  const hasError = imageErrors.has(currentIndex)

  return (
    <>
      {/* Main Carousel */}
      <div
        ref={carouselRef}
        className={`relative group ${className}`}
        {...swipeHandlers}
        role="region"
        aria-label="이미지 캐러셀"
        aria-live="polite"
      >
        {/* Image Container */}
        <div className="relative w-full h-48 bg-[#F5F5F7] rounded-[20px] overflow-hidden">
          {hasError ? (
            // Error State
            <div className="w-full h-full flex flex-col items-center justify-center text-[#86868B]">
              <ZoomIn className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">이미지를 불러올 수 없습니다</p>
            </div>
          ) : (
            // Image with lazy loading
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading={currentIndex === 0 ? 'eager' : 'lazy'}
              onError={() => handleImageError(currentIndex)}
              onClick={() => setIsLightboxOpen(true)}
              style={{ cursor: 'zoom-in' }}
              aria-label={`${currentImage.label || currentImage.alt} (클릭하여 확대)`}
            />
          )}

          {/* Image Label */}
          {currentImage.label && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-sm font-semibold">{currentImage.label}</p>
            </div>
          )}

          {/* Navigation Buttons (visible on hover/desktop) */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                aria-label="이전 이미지"
                tabIndex={0}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                aria-label="다음 이미지"
                tabIndex={0}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Image Indicators (Dots) */}
        {images.length > 1 && (
          <div
            className="flex items-center justify-center gap-2 mt-3"
            role="tablist"
            aria-label="이미지 선택"
          >
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-[#000000]'
                    : 'w-2 bg-[#D1D1D6] hover:bg-[#86868B]'
                }`}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`${img.label || `이미지 ${index + 1}`} 보기`}
                tabIndex={index === currentIndex ? 0 : -1}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="text-center mt-2">
            <span className="text-xs text-[#86868B]">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="이미지 확대 보기"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Lightbox Image */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="w-full h-full object-contain"
              style={{ maxHeight: '90vh' }}
            />

            {/* Lightbox Label */}
            {currentImage.label && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 text-center">
                <p className="text-white font-semibold">{currentImage.label}</p>
              </div>
            )}

            {/* Lightbox Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="이전 이미지"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="다음 이미지"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  )
}
