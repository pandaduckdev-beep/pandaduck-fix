# 수리 작업기 리스트 성능 개선 계획

## 현재 상황 분석

### 현재 구현 (`src/app/components/RepairLogsPage.tsx`)
- `useInfiniteQuery`로 무한 스크롤 구현 (7개씩 로드)
- 모든 아이템이 DOM에 렌더링됨 (가상화 없음)
- `loading="lazy"` 사용 중이나 불충분
- 썸네일 최적화 함수 존재 (`getOptimizedThumbnailUrl`)

### 문제점
1. **DOM 과부하**: 스크롤할수록 DOM 노드 증가
2. **이미지 동시 로딩**: 화면에 보이지 않는 이미지도 로딩 시작
3. **렌더링 블로킹**: 이미지 로딩 완료까지 레이아웃 지연
4. **메모리 누수 가능성**: 무한 스크롤로 메모리 증가

---

## 구현 계획

### Phase 1: LazyImage 컴포넌트 구현

**목표**: IntersectionObserver 기반 이미지 지연 로딩

```tsx
// src/components/common/LazyImage.tsx
interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholderClassName?: string
  width?: number
  height?: number
  rootMargin?: string  // iOS willDisplayCell처럼 미리 로드
}
```

**핵심 기능**:
- `rootMargin: "200px"` - 화면에 보이기 200px 전에 로드 시작
- Skeleton placeholder 표시
- 로드 완료 시 fade-in 애니메이션
- 고정된 width/height로 레이아웃 시프트 방지
- 에러 시 fallback 이미지

### Phase 2: Virtualized List 적용

**라이브러리 선택**: `@tanstack/react-virtual`
- React Query와 같은 TanStack 생태계
- 가볍고 유연함
- 동적 높이 지원

**구현 방식**:
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: logs.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 120,  // 예상 아이템 높이
  overscan: 3,  // 화면 밖 3개 추가 렌더링
})
```

### Phase 3: RepairLogsPage 리팩토링

**변경 사항**:
1. 리스트 영역을 가상화된 컨테이너로 교체
2. 각 아이템에 LazyImage 적용
3. Skeleton UI 개선

---

## 파일 구조

```
src/
├── components/
│   └── common/
│       └── LazyImage.tsx          # 새로 생성
├── app/
│   └── components/
│       └── RepairLogsPage.tsx     # 수정
└── hooks/
    └── useLazyImage.ts            # (선택) 재사용 가능한 훅
```

---

## 구현 상세

### 1. LazyImage 컴포넌트

```tsx
// src/components/common/LazyImage.tsx
import { useState, useRef, useEffect } from 'react'

interface LazyImageProps {
  src: string | null
  alt: string
  className?: string
  width: number
  height: number
  rootMargin?: string
  fallback?: React.ReactNode
}

export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  rootMargin = '200px 0px',
  fallback
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imgRef.current || !src) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold: 0 }
    )

    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [src, rootMargin])

  if (!src || hasError) {
    return (
      <div
        className={`bg-[#E5E5E5] flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {fallback}
      </div>
    )
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#E5E5E5] animate-pulse" />
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      )}
    </div>
  )
}
```

### 2. Virtualized List 적용

```tsx
// RepairLogsPage.tsx 수정
import { useVirtualizer } from '@tanstack/react-virtual'
import { LazyImage } from '@/components/common/LazyImage'

// 리스트 영역
const parentRef = useRef<HTMLDivElement>(null)

const virtualizer = useVirtualizer({
  count: logs.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 140,  // 아이템 높이 + gap
  overscan: 5,
})

// 렌더링
<div ref={parentRef} className="h-[calc(100vh-200px)] overflow-auto">
  <div
    style={{
      height: `${virtualizer.getTotalSize()}px`,
      position: 'relative',
    }}
  >
    {virtualizer.getVirtualItems().map((virtualRow) => {
      const log = logs[virtualRow.index]
      return (
        <div
          key={log.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          <RepairLogCard log={log} />
        </div>
      )
    })}
  </div>
</div>
```

### 3. RepairLogCard 분리

```tsx
// 별도 컴포넌트로 분리하여 메모이제이션
const RepairLogCard = memo(({ log, onClick }: { log: RepairLog, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full bg-[#F5F5F7] rounded-[20px] p-4 text-left hover:bg-[#EBEBED] transition-colors"
  >
    <div className="flex gap-4">
      <LazyImage
        src={getOptimizedThumbnailUrl(log.thumbnail_url, 200)}
        alt={log.title}
        width={80}
        height={80}
        className="rounded-xl flex-shrink-0"
        fallback={<Gamepad2 className="w-8 h-8 text-[#86868B]" />}
      />
      {/* ... content ... */}
    </div>
  </button>
))
```

---

## 작업 순서 (TODO)

### Step 1: 의존성 설치
```bash
npm install @tanstack/react-virtual
```

### Step 2: LazyImage 컴포넌트 생성
- [ ] `src/components/common/LazyImage.tsx` 생성
- [ ] IntersectionObserver 기반 로직 구현
- [ ] Skeleton/Placeholder UI 구현
- [ ] 에러 핸들링 추가

### Step 3: RepairLogCard 컴포넌트 분리
- [ ] `src/components/repair/RepairLogCard.tsx` 생성
- [ ] `React.memo`로 최적화
- [ ] LazyImage 적용

### Step 4: RepairLogsPage 리팩토링
- [ ] useVirtualizer 훅 적용
- [ ] 스크롤 컨테이너 구조 변경
- [ ] 무한 스크롤 로직 조정 (virtualizer와 통합)

### Step 5: 테스트 및 최적화
- [ ] 빠른 스크롤 테스트
- [ ] 메모리 사용량 확인
- [ ] 네트워크 요청 패턴 확인
- [ ] 모바일 디바이스 테스트

---

## 성능 개선 포인트 요약

| 항목 | Before | After |
|------|--------|-------|
| DOM 노드 수 | 모든 아이템 렌더링 | 화면에 보이는 것 + overscan만 |
| 이미지 로딩 | 모든 썸네일 동시 로드 | 보이기 직전에만 로드 |
| 레이아웃 시프트 | 이미지 로드 시 발생 가능 | 고정 크기로 방지 |
| 초기 렌더링 | 데이터 + 이미지 완료 후 | 데이터만 있으면 즉시 표시 |
| 메모리 사용 | 스크롤에 따라 증가 | 일정하게 유지 |

---

## 예상 결과

1. **즉시 스크롤 가능**: 데이터 로드 완료 시 바로 인터랙션 가능
2. **부드러운 스크롤**: 가상화로 DOM 부담 감소
3. **네트워크 효율화**: 필요한 이미지만 요청
4. **iOS 앱 수준 UX**: RecyclerView/UITableView와 유사한 경험
