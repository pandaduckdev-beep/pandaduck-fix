import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useSwipeable } from 'react-swipeable'

interface ReviewImageCarouselProps {
  images: string[]
  className?: string
}

export function ReviewImageCarousel({ images, className = '' }: ReviewImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  // Single image - no carousel needed
  if (images.length === 1) {
    return (
      <>
        <div
          className={`relative w-full aspect-[4/3] rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[#E5E5E7] cursor-pointer ${className}`}
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={images[0]}
            alt="Review"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Lightbox for single image */}
        {isLightboxOpen && createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <img
              src={images[0]}
              alt="Review"
              className="w-screen h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
      </>
    )
  }

  // Multiple images - show carousel
  return (
    <>
      <div className={`relative ${className}`}>
        <div
          {...handlers}
          className="relative w-full aspect-[4/3] rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[#E5E5E7] cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={images[currentIndex]}
            alt={`Review ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Navigation Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <img
            src={images[currentIndex]}
            alt={`Review ${currentIndex + 1}`}
            className="w-screen h-screen object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Navigation in Lightbox */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Lightbox Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full z-10">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
