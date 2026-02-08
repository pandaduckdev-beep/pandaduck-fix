import { Menu, Loader2, ChevronRight, Calendar, Gamepad2, Share2 } from 'lucide-react'
import { Footer } from '@/app/components/Footer'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MenuDrawer } from '@/app/components/MenuDrawer'
import { supabase } from '@/lib/supabase'
import { useSlideUp } from '@/hooks/useSlideUp'
import type { RepairLog } from '@/types/database'
import { toast } from 'sonner'

export function RepairLogsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [logs, setLogs] = useState<RepairLog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10
  const { setRef } = useSlideUp(logs.length + 4)

  // URL 파라미터에서 선택된 로그 ID 가져오기
  const selectedLogId = searchParams.get('log')
  const selectedLog = logs.find(log => log.id === selectedLogId) || null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 작업기 데이터 로드 (페이징)
  const loadLogs = async (pageNum: number) => {
    try {
      if (pageNum === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const from = pageNum * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error } = await supabase
        .from('repair_logs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      if (data) {
        if (pageNum === 0) {
          setLogs(data)
        } else {
          setLogs((prev) => [...prev, ...data])
        }

        if (data.length < PAGE_SIZE) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Failed to load repair logs:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // 조회수 증가
  const incrementViewCount = async (logId: string) => {
    try {
      await supabase.rpc('increment_repair_log_view', { log_id: logId })
    } catch (error) {
      // 조회수 증가 실패는 무시
      console.error('Failed to increment view count:', error)
    }
  }

  // 공유하기
  const handleShare = async () => {
    if (!selectedLog) return

    const url = `${window.location.origin}/repair-logs?log=${selectedLog.id}`
    const title = selectedLog.title
    const text = `[PandaDuck Fix] "${title}"\n\n컨트롤러 수리 작업 후기를 공유합니다.`

    try {
      // 웹 공유 API 지원 여부 확인 (모바일)
      if (navigator.share && navigator.canShare && navigator.canShare({ title, url, text })) {
        await navigator.share({
          title,
          text,
          url,
        })
        toast.success('공유되었습니다.')
      } else {
        // 지원하지 않는 경우 클립보드에 복사
        const shareText = `${text}\n\n${url}`
        await navigator.clipboard.writeText(shareText)
        toast.success('링크가 클립보드에 복사되었습니다.')
      }
    } catch (error) {
      console.error('Failed to share:', error)
      // 사용자가 공유를 취소한 경우 무시
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('공유에 실패했습니다.')
      }
    }
  }

  // URL 파라미터가 변경될 때 스크롤 잠금/해제
  useEffect(() => {
    if (selectedLogId) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [selectedLogId])

  // 초기 로드
  useEffect(() => {
    loadLogs(0)
  }, [])

  // 무한 스크롤 처리
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const pageHeight = document.documentElement.scrollHeight

      if (scrollPosition >= pageHeight - 500 && !loadingMore && hasMore && !selectedLogId) {
        const nextPage = page + 1
        setPage(nextPage)
        loadLogs(nextPage)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page, loadingMore, hasMore, selectedLogId])

  // 상세 보기 열기
  const openDetail = (log: RepairLog) => {
    setSearchParams({ log: log.id })
    incrementViewCount(log.id)
    document.body.style.overflow = 'hidden'
  }

  // 상세 보기 닫기
  const closeDetail = () => {
    setSearchParams({})
    document.body.style.overflow = ''
  }

  // 브라우저 뒤로가기/앞으로가기 처리
  useEffect(() => {
    if (selectedLogId) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [selectedLogId])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-lg tracking-tight"
            style={{ fontWeight: 600 }}
          >
            PandaDuck Fix
          </button>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Menu Drawer */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Hero */}
      <section className="max-w-md mx-auto px-6 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div ref={setRef(0)} className="slide-up" style={{ transitionDelay: '0s' }}>
          <h1 className="text-3xl sm:text-4xl mb-3 sm:mb-4" style={{ fontWeight: 700 }}>
            수리 작업기
          </h1>
          <p className="text-base sm:text-lg text-[#86868B] leading-relaxed">
            PandaDuck Fix의 꼼꼼한
            <br />
            수리 과정을 확인해보세요
          </p>
        </div>
      </section>

      {/* Logs List */}
      <section className="max-w-md mx-auto px-6 pb-6 sm:pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {logs.map((log, index) => (
                <button
                  key={log.id}
                  ref={setRef(index + 1)}
                  onClick={() => openDetail(log)}
                  className="slide-up w-full bg-[#F5F5F7] rounded-[20px] sm:rounded-[28px] p-4 sm:p-5 text-left hover:bg-[#EBEBED] transition-colors"
                  style={{ transitionDelay: `${Math.min(index * 0.1, 0.5)}s` }}
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    {log.thumbnail_url ? (
                      <img
                        src={log.thumbnail_url}
                        alt={log.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#E5E5E5] rounded-xl flex-shrink-0 flex items-center justify-center">
                        <Gamepad2 className="w-8 h-8 text-[#86868B]" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3
                        className="text-base sm:text-lg mb-1 line-clamp-2"
                        style={{ fontWeight: 600 }}
                      >
                        {log.title}
                      </h3>

                      {/* Controller Model */}
                      {log.controller_model && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-1 bg-white rounded-full">
                            {log.controller_model}
                          </span>
                        </div>
                      )}

                      {/* Content Preview */}
                      {log.content && (
                        <p className="text-sm text-[#86868B] mb-2 line-clamp-2">
                          {log.content.replace(/<[^>]+>/g, '').slice(0, 100)}
                        </p>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-[#86868B]">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(log.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-[#86868B] flex-shrink-0 self-center" />
                  </div>
                </button>
              ))}
            </div>

            {loadingMore && (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <Loader2 className="w-6 h-6 animate-spin text-black" />
              </div>
            )}

            {!hasMore && logs.length > 0 && (
              <div className="text-center py-6 sm:py-8 text-[#86868B] text-xs sm:text-sm">
                모든 작업기를 불러왔습니다
              </div>
            )}
          </>
        )}

        {!loading && logs.length === 0 && (
          <div className="text-center py-12 text-[#86868B] text-sm">
            등록된 수리 작업기가 없습니다.
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-md mx-auto px-6 pb-8 sm:pb-12">
        <div
          ref={setRef(logs.length + 1)}
          className="slide-up"
          style={{ transitionDelay: '0s' }}
        >
          <div className="bg-[#000000] text-white rounded-[20px] sm:rounded-[28px] p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl" style={{ fontWeight: 700 }}>
              전문가에게 맡기세요
            </h3>
            <p className="text-sm sm:text-base text-[#86868B]">
              섬세한 손길로 컨트롤러를
              <br />
              새것처럼 되살려 드립니다
            </p>
            <button
              onClick={() => navigate('/controllers')}
              className="w-full bg-white text-black py-3.5 sm:py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96] mt-4 sm:mt-6 text-sm sm:text-base"
              style={{ fontWeight: 600 }}
            >
              수리 신청하기
            </button>
          </div>
        </div>
      </section>

      <div ref={setRef(logs.length + 2)} className="slide-up" style={{ transitionDelay: '0s' }}>
        <Footer />
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[rgba(0,0,0,0.05)]">
            <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
              <button
                onClick={closeDetail}
                className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
                aria-label="뒤로가기"
              >
                ←
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
                title="공유하기"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div key={selectedLog.id} className="max-w-md mx-auto px-6 py-6 sm:py-8">
            {/* Title */}
            <h1
              className="text-2xl sm:text-3xl mb-4 slide-up"
              data-animate
              style={{ fontWeight: 700, animationDelay: '0s' }}
            >
              {selectedLog.title}
            </h1>

            {/* Meta */}
            <div
              className="space-y-3 mb-6 slide-up"
              data-animate
              style={{ animationDelay: '0.1s' }}
            >
              {/* Controller Model */}
              {selectedLog.controller_model && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-black text-white rounded-full font-semibold">
                    기종
                  </span>
                  <span className="text-sm px-3 py-1.5 bg-[#F5F5F7] rounded-full font-medium">
                    {selectedLog.controller_model}
                  </span>
                </div>
              )}

              {/* Repair Type */}
              {selectedLog.repair_type && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-black text-white rounded-full font-semibold">
                    서비스
                  </span>
                  <span className="text-sm px-3 py-1.5 bg-[#F5F5F7] rounded-full font-medium">
                    {selectedLog.repair_type}
                  </span>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-[#86868B]">
                <Calendar className="w-3 h-3" />
                <span>{new Date(selectedLog.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>

            {/* Content */}
            <div
              className="prose prose-sm sm:prose max-w-none slide-up"
              data-animate
              style={{ animationDelay: '0.2s' }}
            >
              <div
                className="text-[#1d1d1f] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: selectedLog.content
                    .replace(/\n\n/g, '<br/><br/>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>

            {/* Images */}
            {selectedLog.image_urls && selectedLog.image_urls.length > 0 && (
              <div
                className="mt-6 space-y-4 slide-up"
                data-animate
                style={{ animationDelay: '0.3s' }}
              >
                {selectedLog.image_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${selectedLog.title} 이미지 ${index + 1}`}
                    className="w-full rounded-2xl"
                  />
                ))}
              </div>
            )}

            {/* Signature */}
            <div
              className="mt-8 p-4 bg-[#F5F5F7] rounded-2xl slide-up"
              data-animate
              style={{ animationDelay: '0.5s' }}
            >
              <div className="text-center">
                <p className="text-xs font-medium text-gray-900 mb-1">
                  PandaDuck Fix
                </p>
                <p className="text-xs text-[#86868B]">
                  게임의 즐거움을 되찾는 순간까지
                </p>
              </div>
            </div>

            {/* CTA */}
            <div
              className="mt-6 pt-6 border-t border-[rgba(0,0,0,0.1)] slide-up"
              data-animate
              style={{ animationDelay: '0.6s' }}
            >
              <button
                onClick={() => {
                  closeDetail()
                  navigate('/controllers')
                }}
                className="w-full bg-black text-white py-4 rounded-full transition-transform hover:scale-[0.98] active:scale-[0.96]"
                style={{ fontWeight: 600 }}
              >
                나도 수리 신청하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
