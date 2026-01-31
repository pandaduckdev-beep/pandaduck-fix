import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { DaumPostcodeData } from '@/types/daum-postcode'
import { useToast } from '@/hooks/useToast.tsx'

interface AddressSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: { postalCode: string; address: string }) => void
}

export function AddressSearchModal({ isOpen, onClose, onComplete }: AddressSearchModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { error: showError } = useToast()

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    let mounted = true

    const loadAndInit = async () => {
      try {
        // 스크립트 로드
        if (!window.daum?.Postcode) {
          const script = document.createElement('script')
          script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Script load failed'))
            document.head.appendChild(script)
          })
        }

        if (!mounted || !containerRef.current || !window.daum?.Postcode) return

        // 컨테이너 초기화
        containerRef.current.innerHTML = ''

        // Postcode embed
        const postcode = new window.daum.Postcode({
          oncomplete: (data: DaumPostcodeData) => {
            const selectedAddress = data.roadAddress || data.jibunAddress
            onComplete({
              postalCode: data.zonecode,
              address: selectedAddress,
            })
            onClose()
          },
          width: '100%',
          height: '100%',
        })

        if (containerRef.current) {
          postcode.embed(containerRef.current)
        }
      } catch (err) {
        console.error('Failed to load address search:', err)
        showError('로드 실패', '주소 검색을 불러오는데 실패했습니다.')
        onClose()
      }
    }

    loadAndInit()

    return () => {
      mounted = false
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [isOpen, onClose, onComplete])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg h-[70vh] sm:h-[65vh] sm:rounded-[28px] rounded-t-[28px] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-[rgba(0,0,0,0.05)] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg sm:text-xl" style={{ fontWeight: 700 }}>
            주소 검색
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Postcode Container */}
        <div
          ref={containerRef}
          className="flex-1 w-full"
        />

        {/* Footer Guide */}
        <div className="bg-[#F5F5F7] px-6 py-3 text-xs sm:text-sm text-[#86868B] text-center flex-shrink-0">
          도로명 주소 또는 지번 주소를 검색하세요
        </div>
      </div>
    </div>,
    document.body
  )
}
