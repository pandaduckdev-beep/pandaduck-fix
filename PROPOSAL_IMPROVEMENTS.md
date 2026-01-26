# PandaDuckPix 프로젝트 개선 제안서

## 📋 프로젝트 개요

- **프로젝트명**: PandaDuck Fix
- **프로젝트 유형**: 듀얼드(게임패드) 컨트롤러 수리 서비스
- **기술 스택**: React + Vite + TypeScript + Supabase
- **모바일 지원**: iOS, Android (Capacitor)
- **PWA 지원**: ✅
- **코드 베이스**: 90+ TypeScript/React 파일

---

## 🏗️ 1. 프로젝트 아키텍처 구조

### 현재 구조

```
PandaDuckPix/
├── src/
│   ├── admin/                  # 관리자 사이트 (개발용)
│   │   ├── pages/         # 대시보드, 서비스, 수리 신청, 리뷰 등
│   │   ├── components/     # 관리자 UI 컴포넌트
│   │   └── contexts/      # 인증, 상태 관리
│   ├── app/                # 사용자 사이트 (공개용)
│   │   ├── components/ui/   # Radix UI 컴포넌트
│   │   ├── lib/           # 공통 라이브러리
│   └── types/          # TypeScript 타입 정의
├── supabase/            # 데이터베이스 마이그레이션
├── public/              # 정적 에셋
└── package.json
```

### 특징

- ✅ 관리자/사용자 사이트 분리
- ✅ 인증 시스템 구현
- ✅ PWA 지원 (Service Worker)
- ✅ 모바일 앱 지원 (Capacitor)
- ✅ 타입 안전성 (TypeScript)
- ✅ 컴포넌트 재사용성 (Radix UI)

---

## 2. 기술 스택 분석

### 현재 의존성

```json
{
  "프레임워크": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "빌더": {
    "vite": "^6.3.5"
  },
  "UI": {
    "radix-ui/react-*": "다수 (버전 다름)",
    "lucide-react": "아이콘",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1"
  },
  "상태 관리": {
    "@radix-ui/react-context": "^2.2.6"
  },
  "애니메이션": {
    "motion": "^12.23.24"
  },
  "드래그 앤드롭": {
    "@dnd-kit/core": "^16.0.1",
    "react-dnd": "^16.0.1"
    "react-dnd-html5-backend": "^16.0.1"
  },
  "데이터베이스": {
    "@supabase/supabase-js": "^2.91.0"
  },
  "폼/데이터": {
    "react-hook-form": "^7.55.0",
    "sonner": "^2.0.0"
  },
  "모바일": {
    "@capacitor/core": "^6.2.0",
    "@capacitor/ios": "^6.2.0",
    "@capacitor/android": "^6.2.0",
    "@dnd-kit/sortable": "^10.0.0"
  },
  "기타": {
    "react-router-dom": "^7.12.0",
    "date-fns": "^3.6.0",
    "nanoid": "^5.1.6",
    "sonner": "^2.0.0",
    "input-otp": "^1.4.2"
  }
}
```

### 장점

- ✅ 최신 기술 스택 사용 (React 18, Vite 6.3)
- ✅ 컴포넌트 라이브러리 (Radix UI) 사용
- ✅ 타입 안전성 보장 (TypeScript strict mode)
- ✅ 애니메이션 라이브러리 (Framer Motion)
- ✅ PWA 지원으로 오프라인 기능

---

## 3. 상태 관리 분석

### 현재 구조

- **인증**: AuthContext (컨텍스트 API, localStorage)
- **전역 상태**: Redux/Zustand 없음 (단순히 useState 사용)
- **페이지별 상태**: 각 컴포넌트가 독립적 useState 사용

### 문제점

1. ❌ **전역 상태 관리 부재**
   - 사용자 인증 정보, 테마 등을 전역으로 공유하지 않음
   - 페이지 간 이동 시 상태 초기화 발생

2. ⚠️ **데이터 캐싱 전략 부족**
   - 매번 페이지 방문 시 API 호출 중복
   - React Query, SWR 같은 캐싱 라이브러리 사용하지 않음

3. ⚠️ **에러 처리 일관성 없음**
   - 일부 페이지에서 try-catch 사용, 일부는 아님
   - 에러 메시지 처리 방식이 다름

4. ❌ **로딩 상태 관리 불완전**
   - 각 컴포넌트가 독립적으로 loading 상태 관리
   - 글로벌 로딩 스피너 없음

---

## 4. 라우팅 분석

### 현재 구조

- **라우터**: React Router (v7)
- **경로**: `/admin/*`, `/admin/repairs`, `/admin/reviews`, `/admin/reviews/:token`
- **네비게이션**: `navigate` 함수 사용

### 문제점

1. ⚠️ **네비게이션 가드 불활성**
   - 인증 없이도 `/admin` 접근 가능
   - 사용자 세션 확인 없이도 API 호출 가능

2. ❌ **쿼리 관리 부재**
   - 페이지 전환 시 로딩 상태 유지 불가
   - 뒤로 가기 버튼 활성/비활성 처리 필요

3. ⚠️ **URL 파라미터 처리 부족**
   - 동적 라우트 파라미터 (`/admin/reviews/:token`) 처리가 명확하지 않음

---

## 5. 데이터베이스 분석

### 현재 구조

- **백엔드**: Supabase (PostgreSQL)
- **ORM**: Supabase JS SDK
- **RLS**: Row Level Security 활성화

### 테이블 구조

```sql
-- 기존 테이블 (유지보)
services                    -- 공통 서비스
service_options             -- 서비스 옵션
service_combos             -- 서비스 콤보
repair_requests             -- 수리 신청
repair_request_services     -- 수리 신청 서비스
reviews                   -- 리뷰
controller_models          -- 컨트롤러 모델
controller_services         -- ★ 새로 추가: 컨트롤러별 서비스
controller_service_options -- ★ 새로 추가: 컨트롤러별 옵션
admin_users               -- 관리자 계정
```

### RLS 정책

- **public**: services, service_options, service_combos, controller_models (SELECT만)
- **authenticated (관리자)**: controller_services, controller_service_options, admin_users (모든 권한)
- **authenticated (모두)**: repair_requests, repair_request_services, reviews (INSERT만)
- **authenticated**: service_combos (모든 권한)

### 최근 변경 (v024 마이그레이션)

- ✅ `controller_services` 테이블 생성 - 컨트롤러별 독립 서비스 관리
- ✅ `controller_service_options` 테이블 생성 - 컨트롤러별 독립 옵션 관리
- ✅ UNIQUE 인덱스: `controller_model_id + service_id` 조합으로 중복 방지

### 문제점

1. ❌ **인덱싱 최적화 부족**
   - N+1 쿼리 로딩 시 병렬링 문제 발생 가능
   - 커버링 인덱스가 없을 수도 있음
   - 정렬, 검색 쿼리에 인덱스 필요

2. ⚠️ **데이터 무결성 보장 부족**
   - 외래 키 제약조건 확인
   - 트랜잭션 내에서 데이터 정합성 검증 부족

3. ❌ **삭제된 데이터 관리 부족**
   - CASCADE DELETE로 자동 삭제되지만, 복구 기능 없음

4. ⚠️ **백업/복구 전략 부재**
   - 데이터 삭제 시점 없음
   - 복구를 위한 soft delete 미구현

---

## 6. UI 컴포넌트 분석

### 현재 구조

- **컴포넌트**: Radix UI (Dialog, Dropdown, Table, Form, 등)
- **아이콘**: Lucide React
- **스타일링**: Emotion + TailwindCSS

### 재사용성

- ✅ **Radix UI Primitives** - 잘 설계된 재사용 가능 컴포넌트
- ⚠️ **커스텀 컴포넌트** - 간단히 사용, 재사용성 낮음
- ✅ **훅(Hook)** - React Hook Form 사용

### 문제점

1. ❌ **커스템 컴포넌트 중복**
   - 동일한 컴포넌트를 여러 곳에서 생성
   - 예: Button, Input, Select 등이 여러 버전으로 존재 가능

2. ⚠️ **반응형 디자인 일관성**
   - 모달, 드롭다운, 폼 등에서 다른 스타일링 사용

3. ❌ **접근성 개선 필요**
   - 키보드 접근성 검토 필요
   - ARIA 라벨 적절성 확인 필요
   - 포커스/포커 아웃 기능 개선

---

## 7. 타입 안전성 분석

### 현재 상태

- ✅ TypeScript strict mode 활성화
- ⚠️ `any` 타입 과다 사용 (일부 컴포넌트)
- ⚠️ 타입 정의 불완전 (database.ts)

### 문제점

1. ⚠️ **`any` 타입 과다 사용**

   ```typescript
   // 예시 (비권장)
   const [services, setServices] = useState<any[]>([])

   // 권장 방법
   interface Service {
     id: string
     name: string
     ...
   }
   const [services, setServices] = useState<Service[]>([])
   ```

2. ⚠️ **에러 타입 경고 무시**
   - `@ts-ignore`, `@ts-expect-error` 사용 빈번 높음
   - 타입 안전성 개선을 위해 경고 수정 필요

3. ❌ **데이터베이스 타입 불일치**
   - Supabase 자동 생성 타입 사용 불가
   - 수동으로 정의한 타입과 실제 스키마 불일치 가능

---

## 8. 코드 품질 분석

### 문제점

1. ❌ **중복 코드 발견**
   - 비슷한 API 호출 로직이 여러 곳에서 중복
   - 예: `loadServices`, `loadControllers`, `loadStats` 등에서 비슷한 패턴

2. ⚠️ **예외 처리 불일관**

   ```typescript
   // 좋은 예시
   try {
     await apiCall()
   } catch (error) {
     if (error instanceof NetworkError) {
       toast.error('네트워크 오류가 발생했습니다.')
     } else if (error instanceof ValidationError) {
       toast.error('입력값을 확인해주세요.')
     } else {
       toast.error('오류가 발생했습니다.')
       logError(error) // 에러 로깅
     }
   }

   // 현재 상태 (문제 있음)
   try {
     await someOperation()
   } catch (error) {
     console.error(error) // 콘솔에만 출력
     toast.error('오류가 발생했습니다.') // 일반 메시지만
   }
   ```

3. ❌ **코드 분리 불충분**
   - 일부 컴포넌트가 너무 큼음 (예: Dashboard.tsx 424줄)
   - 파일당 500줄 이하 권장 (너무 크면 파일 나누기 힘듦음)

4. ⚠️ **주석 불충분**
   - 한글/영문 혼용으로 인코딩 문제 있음
   - 중요 로직에 주석 부족

---

## 9. 성능 관련 문제

### 1. 불필요한 리렌더링

- **문제**: 컴포넌트가 매 렌더링됨
- **영향**: 초기 로딩 속도 저하
- **해결**:
  - React.memo 활용하여 불필요한 리렌더링 방지
  - useMemo 활용하여 연산 결과 캐싱

### 2. API 호출 최적화

- **문제**: 페이지 방문 시 매번 같은 API 호출
- **영향**: 불필요한 서버 부하, 사용자 경험 저하
- **해결**:
  - React Query 또는 SWR 도입 검토
  - 캐싱 레이어 활용
  - optimistic updates로 사용자 경험 개선

### 3. 이미지/에셋 로딩

- **문제**: 이미지 미리 로드되지 않음
- **영향**: 이미지가 포함된 컴포넌트 첫 번 렌더링 느림
- **해결**:
  - 이미지 prefetch 구현
  - Lazy loading 활용

### 4. 번들 크기

- **현재 상태**: 약 475KB
- **분석**:
  - 번들 크기 적절 수준 (React 앱의 경우)
  - 개선 여지:
    - Code splitting 활용
    - Route-based lazy loading
    - Tree shaking (Vite 자동 최적화)
    - 불필요한 의존성 제거

---

## 10. 테스트 현황

### 현재 상태

- ❌ **유닛 테스트 파일 없음**
- ❌ **통합 테스트 부족**
- ⚠️ **수동 테스트에만 의존**

### 문제점

1. ❌ **자동화된 테스트 부재**
   - CI/CD 파이프라인에서 테스트 자동 실행되지 않음
   - PR 시 자동 테스트가 실행되지 않음

2. ❌ **테스트 커버리지 낮음**
   - 핵심 기능(결제, 인증)에 대한 테스트 부족
   - 사용자 데이터 유효성에 대한 테스트 부족

3. ❌ **통합 테스트 부족**
   - E2E 테스트, 통합 테스트 켬나리스테스트 부족
   - 데이터베이스 마이그레이션 유효성 검증 테스트 필요

---

## 11. 배포 및 CI/CD

### 현재 상태

- ✅ GitHub Actions 사용 (presumed)
- ✅ Vite 빌드 시스템
- ⚠️ PWA 빌드 후 번들 파일 생성
- ⚠️ **환경 변수 관리**

### 문제점

1. ⚠️ **GitHub Actions 설정 불명확**
   - `.github/workflows/` 폴더 존재하는지 확인 필요
   - 자동 배포 파이프라인 구성 필요
   - 배포 환경(개발/프로덕션) 분리 필요

2. ⚠️ **환경 변수 관리**

   ```bash
   # 현재
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY

   # 권장
   .env.development
   .env.production
   .env.local (git ignore)
   ```

3. ❌ **롤백 전략 부족**
   - 블루-그린 배포 전략 필요
   - 카나리 배포: dev, staging, production
   - 블루-그린 환경에서 개발 시 미리 테스트

---

## 12. 보안 분석

### 현재 상태

- ✅ Row Level Security (RLS) 활성화
- ✅ 관리자 인증 시스템 구현
- ⚠️ API 키가 환경 변수에 노출

### 문제점

1. ⚠️ **환경 변수 관리**
   - `.env` 파일이 git에 커밋되어 있음 (위험)
   - 권장: `.env.local` 사용 (git ignore)
   - production 환경에서는 비밀 보안 서비스 사용

2. ⚠️ **API 키 노출 방지**
   - Supabase Anon Key는 클라이언트에서 노출되면 안됨
   - 권장:
     - `.env` 파일 무시
     - 환경 변수 서비스 (Vercel, AWS Secrets Manager 등) 사용

3. ⚠️ **CSRF 방어**
   - 현재 CSRF 토큰/헤더 확인 필요
   - Supabase는 CSRF 방어를 자동으로 처리하지만, 추가 방어 권장

4. ⚠️ **SQL Injection 방어**
   - Supabase JS SDK가 parameterized 쿼리를 사용하여 자동 방어
   - 사용자 입력 검증 필요
   - ID 기반 조회 대신 파라미터 기반 쿼리 사용

---

## 13. 우선순위 개선 제안

### 🔴 Phase 1: 긴급 안정화 (즉시 개선 필요)

#### 1.1 TypeScript 엄격화

**우선순**: 🔴🔴🔴

**작업**:

- ESLint 규칙 강화: `@typescript-eslint/no-explicit-any` 활성화
- `any` 타입 제거 및 구체적 타입 정의
- 타입 안전성 개선: `strict: true`, `noUncheckedIndexedAccess: true`
- 데이터베이스 타입 정의 자동화 수단 검토 (Supabase CLI 도구)

#### 1.2 에러 처리 표준화

**우선순**: 🔴🔴🔴

**작업**:

- 공통 에러 핸들러 생성: `errorHandler`, `apiErrorHandler`
- 에러 타입 분류: `NetworkError`, `ValidationError`, `AuthError`, `DatabaseError`
- 에러 로깅 시스템: console.error + Sentry 같은 도구 도입 검토
- 사용자 친화한 에러 메시지: 구체적인 원인과 해결책 제시

#### 1.3 인증 및 권한 강화

**우선순**: 🔴🔴🔴

**작업**:

- RLS 정책 검토 및 강화
- API 라우트 보호: `/admin/*` 경로 인증 필수
- 토큰 갱신 로직 추가 (token 갱신)
- 관리자 권한 등급 관리 기능 추가

### 🟡 Phase 2: 성능 최적화 (1-2주 내)

#### 2.1 데이터 캐싱 도입

**우선순**: 🟡🟡🟡

**작업**:

- React Query 또는 SWR 라이브러리 도입
- Query 캐싱 설정: `staleTime: 5 * 60 * 1000` (5분)
- Optimistic Updates 사용하여 사용자 경험 개선
- React DevTools Profiler로 병목 지점 분석

#### 2.2 컴포넌트 재사용성 개선

**우선순**: 🟡🟡🟡

**작업**:

- 공통 UI 컴포넌트 라이브러리 모음
- React.memo 활용하여 불필요한 리렌더링 방지
- useMemo 활용하여 연산 결과 캐싱

#### 2.3 코드 스플리팅 (코드 품질 개선)

**우선순**: 🟡🟡🟡

**작업**:

- 중복 코드 제거 및 공통 함수 추출
- ESLint 자동 수정 도구 활용
- Prettier 포맷 자동화 설정
- 코드 컨벤션 설정 강화 (한 줄 120자 권장)

#### 2.4 빌드 최적화

\*\*우선순🟡🟡🟡

**작업**:

- Route-based lazy loading 구현
- Bundle analyzer로 번들 크기 분석 및 최적화
- Vite 코드 스플리팅 설정
- 이미지 lazy loading 구현

### 🟢 Phase 3: 테스트 인프라 구축 (2-3주 내)

#### 3.1 유닛 테스트 추가

**우선순**: 🟢🟢🟢

**작업**:

- React Testing Library 도입 (Vitest 또는 React Testing Library)
- 핵심 기능 유닛 테스트 작성:
  - 인증: 로그인/로그아웃, 세션 관리
  - 서비스 관리: CRUD 작업
  - 수리 신청: 생성, 상태 변경, 조회
  - API 라우트 보호
- E2E 테스트: 중요 테스트 시나리오 작성
- 통합 테스트: 실제 환경과 가짜 데이터 사용

#### 3.2 E2E 테스트 도구 설정

**우선순**: 🟢🟢🟢

**작업**:

- Playwright 또는 Cypress 선택
- 테스트 환경 구성 (GitHub Actions)
- 스냅샷 테스트, 비디오 레코딩 테스트
- API 테스트 더블 설정 (msw)

#### 3.3 테스트 커버리지 확대

**우선순**: 🟢🟢🟢

**작업**:

- 단위 테스트: 각 컴포넌트 최소 60% 커버리지
- 통합 테스트: 핵심 사용자 플로우 최소 80% 커버리지
- CI/CD에 테스트 자동 실행 파이프라인 구성

### 🔵 Phase 4: 개발 경험 개선 (1-2주 내)

#### 4.1 개발자 경험 개선

**우선순**: 🔵🔵🔵

**작업**:

- 로딩 상태 개선: 글로벌 로딩 스피너, 로딩 스켈레톤
- 에러 바운더리 추가: toast notification 활용
- 페이지 전환 시 상태 유지 (localStorage, React Query persist)
- 접근성 개선: 키보드 네비게이션, ARIA 라벨

#### 4.2 모니터링 시스템

**우선순**: 🔵🔵🔵

**작업**:

- 에러 로깅: Sentry 또는 LogRocket 도입
- 성능 모니터링: Web Vitals 도입
- 사용자 분석: Google Analytics 4 또는 Plausible 도입
- Uptime 모니터링: UptimeRobot 또는 Pingdom 도입

### 🟣 Phase 5: 기능 개선 (2-4주 내)

#### 5.1 실시간 기능

**우선순**: 🟣🟣🟣

**작업**:

- 실시간 수리 신청 상태 조회 (관리자, 고객 모두)
- 실시간 알림: 웹소켓 사용
- 웹사이트 점검시 기능

#### 5.2 알림 시스템

**우선순**: 🟣🟣🟣

**작업**:

- 리뷰 알림 시스템 이메일/SMS 발송
- 수리 상태 변경 알림
- 예약 리마인더 알림

#### 5.3 결제 기능

**우선순**: 🟣🟣🟣

**작업**:

- 카드 결제: Toss Payments 또는 Stripe
- 간편 결제: 카카오페이, 네이버페이
- 예약 결제: 예약 시 결제 예약

---

## 14. 기술 부채 해결 전략

### 14.1 단순 실시, 단순하게

- ❌ 새로운 라이브러리/프레임워크 도입 지양
- ✅ 기존 라이브러리 최대한 활용
- ✅ 복잡한 기능은 직접 구현, 프레임워크는 없을 때만 도입

### 14.2 점진적으로 개선

- 🔴 Phase 1부터 순서대로 개선
- 각 단계 완료 후 테스트 및 배포
- 사용자 피드백 수집하며 우선순위 조정

### 14.3 사용자 중심

- 사용자 피드백 수집 및 분석
- A/B 테스트를 통한 UX 개선
- 사용자 인터뷰 인터뷰 수집

---

## 15. 구체적인 실행 계획

### Week 1: 안정화 및 기초 (Phase 1)

- [ ] TypeScript 엄격화
- [ ] 에러 처리 표준화
- [ ] 인증 및 권한 강화
- [ ] RLS 정책 검토 및 강화
- [ ] 취약점 개선: 환경 변수, API 키, SQL 방어

### Week 2: 성능 최적화 (Phase 2)

- [ ] React Query 도입
- [ ] 컴포넌트 재사용성 개선
- [ ] 코드 스플리팅
- [ ] 빌드 최적화
- [ ] 이미지 lazy loading

### Week 3-4: 테스트 인프라 (Phase 3)

- [ ] 유닛 테스트 도구 선택 및 설정
- [ ] 핵심 기능 유닛 테스트 작성
- [ ] E2E 테스트 시나리오 작성
- [ ] 통합 테스트 작성
- [ ] CI/CD 파이프라인 구성

### Week 5-6: 개발 경험 및 기능 개선 (Phase 4-5)

- [ ] 개발자 경험 개선
- [ ] 모니터링 시스템 도입
- [ ] 실시간 기능
- [ ] 알림 시스템
- [ ] 결제 기능

---

## 16. 결론

### 현재 상태 평가

| 항목       | 점수 (1-10) | 설명                                           |
| ---------- | ----------- | ---------------------------------------------- |
| 기술 스택  | 8/10        | 최신 기술 사용, 잘 선택됨                      |
| 코드 품질  | 6/10        | TypeScript 사용하지만 any 과다, 중복 코드 있음 |
| 성능       | 7/10        | 빌드 최적화 일부 되어있음                      |
| 보안       | 7/10        | RLS 활성화되어 있지만 개선 필요                |
| 테스트     | 3/10        | 유닛 테스트가 전혀 거의 없음                   |
| 배포/CI-CD | 6/10        | 기본 설정은 되어있음                           |

### 강점

- ✅ 최신 기술 스택 (React 18, Vite 6.3, TypeScript)
- ✅ PWA 지원으로 오프라인 가능
- ✅ 모바일 앱 지원 (iOS/Android)
- ✅ 컨트롤러별 독립 서비스 관리 시스템 완성
- ✅ Radix UI 컴포넌트 사용으로 좋은 UX

### 개선 필요 핵심

1. 🔴 TypeScript 엄격화 및 타입 안전성
2. 🔴 에러 처리 표준화
3. 🟡 데이터 캐싱 및 성능 최적화
4. 🟢 테스트 인프라 구축
5. 🟣 개발자 경험 개선
6. 🟣 모니터링 시스템 도입

### 전략적 우선순위

1. **안정화와 신뢰성**: 사용자 데이터 손실 방지, 서비스 안정성 확보
2. **사용자 경험**: 로딩 속도, 접근성, 반응성 개선
3. **개발 효율성**: 자동화 테스트, 문서화, 코드 리뷰
4. **비용 및 확장성**: 서비스별로 스케일링, 플랫폼 추후 도입 고려

---

## 17. 참고 자료

### 문서

- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Radix UI 공식 문서](https://www.radix-ui.com/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [Playwright 공식 문서](https://playwright.dev/)

### 도구

- [React Query](https://tanstack.com/query/latest)
- [SWR](https://swr.vercel.app/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Sentry](https://sentry.io/for/react/)
- [LogRocket](https://logrocket.com/)

---

**문서 작성일시**: 2026년 1월 25일
**버전**: 1.0.0
**작성자**: Sisyphus AI Analysis System
