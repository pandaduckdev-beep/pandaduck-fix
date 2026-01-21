# PandaDuckPix 프로젝트 구조적 개선 제안

## 📊 프로젝트 개요

| 항목 | 현재 상태 |
|------|----------|
| **프로젝트 유형** | React + Vite PWA + Capacitor 모바일 앱 |
| **기술 스택** | React 18, TypeScript, Tailwind CSS 4, Radix UI, Supabase |
| **엔트리 포인트** | 2개 (`index.html`, `admin.html`) |
| **테스트 인프라** | ❌ 없음 |
| **린트/포맷팅** | ❌ 없음 |
| **라우팅** | 혼합 (main: 상태 기반, admin: React Router) |

---

## 🔥 High Priority (즉시 개선 필요)

### 1. 라우팅 불일치 해결

**문제**: `App.tsx`에서 `useState`로 화면 전환, `main.tsx`에서는 React Router 사용

**해결**:
```typescript
// src/app/App.tsx 대신 React Router 사용
<Routes>
  <Route path="/" element={<HomeScreen />} />
  <Route path="/controllers" element={<ControllerSelection />} />
  <Route path="/services" element={<ServiceSelection />} />
  <Route path="/repair/form" element={<RepairForm />} />
  <Route path="/services/list" element={<ServicesPage />} />
  <Route path="/reviews" element={<ReviewsPage />} />
  <Route path="/about" element={<AboutPage />} />
</Routes>
```

**이유**: 상태 기반 라우팅은 뒤로가기/새로고침/URL 공유가 작동하지 않음

### 2. 코드 품질 인프라 추가 (ESLint + Prettier)

**설치**:
```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint eslint-config-prettier eslint-plugin-react-hooks eslint-plugin-react eslint-plugin-react-refresh prettier
```

**설정 파일**:
- `.eslintrc.cjs` 생성
- `.prettierrc` 생성

**npm 스크립트 추가**:
```json
{
  "scripts": {
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx}\""
  }
}
```

### 3. `tsconfig.json` 생성

**프로젝트 루트에 `tsconfig.json` 추가**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4. FigmaCode 디렉토리 처리

**옵션 A: 삭제** (프로토타입이었을 경우)
```bash
rm -rf FigmaCode
```

**옵션 B: 통합** (재사용 컴포넌트가 있을 경우)
```bash
# FigmaCode의 컴포넌트를 src/로 이동
cp -r FigmaCode/src/app/components/ui/* src/app/components/ui/
rm -rf FigmaCode
```

**README에 결정 사항 문서화**

### 5. 엔트리 포인트 통합

**변경 사항**:
- `admin.html` 삭제
- `src/admin/main.tsx` 삭제
- `src/main.tsx`에서 모든 라우팅 처리

**예시**:
```typescript
// src/main.tsx
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      {/* Main App Routes */}
      <Route path="/" element={<App />}>
        <Route index element={<HomeScreen />} />
        <Route path="controllers" element={<ControllerSelection />} />
        <Route path="services" element={<ServiceSelection />} />
        <Route path="repair/form" element={<RepairForm />} />
        <Route path="services/list" element={<ServicesPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>

      {/* Admin App Routes */}
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  </BrowserRouter>
);
```

---

## ⚡ Medium Priority (조만간 개선)

### 6. 테스트 인프라 추가

**설치**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**`vitest.config.ts` 생성**:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

**`src/test/setup.ts` 생성**:
```typescript
import '@testing-library/jest-dom'
```

**npm 스크립트 추가**:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 7. 대형 컴포넌트 분해

**ServicesPage.tsx 분해** (435줄):
```
src/app/components/ServicesPage/
├── index.tsx           # 메인 컴포넌트
├── ServiceCard.tsx     # 서비스 카드
└── useServices.ts      # 이미 존재
```

**ServiceSelection.tsx 분해** (374줄):
```
src/app/components/ServiceSelection/
├── index.tsx              # 메인 컴포넌트
├── ServiceOptionList.tsx  # 옵션 목록
└── ServiceComboCard.tsx   # 콤보 카드
```

### 8. 공유 컴포넌트 라이브러리 구조

**새로운 구조**:
```
src/
├── components/        # app과 admin 모두 사용
│   └── ui/           # shadcn/ui 컴포넌트
└── app/              # app 전용
    └── components/    # app 전용 컴포넌트
```

**마이그레이션 스크립트**:
```bash
# 컴포넌트 이동
mv src/app/components/ui src/components/ui

# import 업데이트
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/app/components/ui|@/components/ui|g'
```

### 9. Error Boundary 구현

**`src/app/components/ErrorBoundary.tsx`**:
```typescript
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || '알 수 없는 오류'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              다시 로드
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

**`src/admin/components/ErrorBoundary.tsx`**:
```typescript
// 위와 동일한 구조
```

**라우트에 적용**:
```typescript
<ErrorBoundary>
  <Routes>
    {/* routes */}
  </Routes>
</ErrorBoundary>
```

### 10. 환경 변수 유효성 검사

**`src/lib/env.ts` 생성**:
```typescript
import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
})

export const env = envSchema.parse(import.meta.env)
```

**`src/lib/supabase.ts` 수정**:
```typescript
import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
```

---

## 💡 Low Priority (점진적 개선)

### 11. CI/CD 구성

**`.github/workflows/ci.yml`**:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
```

### 12. Admin 상태 관리

**TanStack Query (React Query) 설치**:
```bash
npm install @tanstack/react-query
```

**`src/admin/QueryProvider.tsx`**:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 13. Storybook 추가

**설치**:
```bash
npx storybook@latest init
```

**사용 예시**:
```bash
npm run storybook
```

### 14. 성능 모니터링

**번들 분석**:
```bash
npm install -D rollup-plugin-visualizer
```

**`vite.config.ts` 수정**:
```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    // ... other plugins
    visualizer({ open: true }),
  ],
})
```

### 15. API 모킹

**MSW 설치**:
```bash
npm install -D msw
```

**`src/test/mocks/handlers.ts`**:
```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/services', () => {
    return HttpResponse.json([
      { id: '1', name: '서비스 1' },
      { id: '2', name: '서비스 2' },
    ])
  }),
]
```

---

## 📋 구현 순서

1. ✅ ESLint + Prettier 추가 → `npm run lint:fix` 실행
2. ✅ `tsconfig.json` 생성 → 타입 에러 수정
3. ✅ FigmaCode 디렉토리 처리 → 문서화
4. ✅ Error Boundary 추가 → 라우트 감싸기
5. ✅ `App.tsx` 라우팅 수정 → 네비게이션 테스트
6. ✅ `AdminApp.tsx` 라우팅 수정 → 관리자 네비게이션 테스트
7. ✅ 엔트리 포인트 통합 → `admin.html` 삭제
8. ✅ Vitest + 설정 추가 → 첫 테스트 작성
9. ✅ 대형 컴포넌트 분해 → 점진적 추출
10. ✅ 공유 컴포넌트 라이브러리 → 이동 및 import 업데이트

---

## ⚠️ 주의 사항

### 라우팅 변경 시 상태 보존

URL 파라미터를 사용하여 상태 보존:
```typescript
// URL: /repair/form?model=dualsense&services=hall-effect,clicky-buttons
const searchParams = useSearchParams()
const model = searchParams.get('model')
const services = searchParams.get('services')?.split(',')
```

### 중복 UI 컴포넌트 처리

통합 시 모든 import 경로 업데이트:
```bash
# 사용된 import 경로 찾기
grep -r "@/app/components/ui" src/

# 자동으로 경로 업데이트
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/app/components/ui|@/components/ui|g'
```

### 대형 컴포넌트 분해 가이드

분해 기준:
- 300-400줄 이상
- 여러 곳에서 재사용되는 컴포넌트
- 독립적으로 테스트 가능한 로직
- 명확한 단일 책임

---

## 📈 예상 작업 시간

| 우선순위 | 항목 | 예상 시간 |
|----------|------|----------|
| High | 라우팅 수정 | 2-3시간 |
| High | ESLint/Prettier | 1시간 |
| High | tsconfig.json | 30분 |
| High | FigmaCode 처리 | 30분 |
| High | 엔트리 포인트 통합 | 1시간 |
| **High 총합** | | **5-6시간** |
| Medium | 테스트 인프라 | 1-2시간 |
| Medium | 컴포넌트 분해 | 2-3시간 |
| Medium | 공유 컴포넌트 | 1-2시간 |
| Medium | Error Boundary | 30분 |
| Medium | 환경 변수 검사 | 30분 |
| **Medium 총합** | | **5-7시간** |
| Low | CI/CD | 1시간 |
| Low | 상태 관리 | 1-2시간 |
| Low | Storybook | 1시간 |
| Low | 성능 모니터링 | 30분 |
| Low | API 모킹 | 1시간 |
| **Low 총합** | | **4-6시간** |

**전체 예상 시간**: 14-19시간 (2-3일)

---

## 🎯 다음 단계

1. High Priority 항목부터 순차적으로 진행
2. 각 항목 완료 후 git commit
3. 테스트 추가 후 코드 검증
4. PR 생성 후 코드 리뷰

---

**문서 생성일**: 2026-01-22
**프로젝트**: PandaDuckPix
**버전**: 1.0.0
