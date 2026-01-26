# PandaDuckPix 프로젝트 분석 및 개선 계획

> 작성일: 2026-01-26
> 프로젝트: 게이밍 컨트롤러 수리 서비스 플랫폼

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [현재 시스템 구조](#현재-시스템-구조)
3. [데이터베이스 스키마 분석](#데이터베이스-스키마-분석)
4. [구현된 주요 기능](#구현된-주요-기능)
5. [최근 변경 사항](#최근-변경-사항)
6. [발견된 문제점 및 개선 사항](#발견된-문제점-및-개선-사항)
7. [향후 개발 계획](#향후-개발-계획)
8. [기술 스택 및 의존성](#기술-스택-및-의존성)

---

## 🎯 프로젝트 개요

**PandaDuckPix**는 PlayStation 및 Nintendo 게이밍 컨트롤러의 전문 수리 서비스를 제공하는 웹 기반 플랫폼입니다.

### 핵심 가치 제안
- **컨트롤러별 맞춤 서비스**: 각 컨트롤러 모델에 최적화된 수리 서비스
- **투명한 가격**: 실시간 가격 계산 및 서비스 옵션 선택
- **효율적인 관리**: 관리자 대시보드를 통한 수리 요청 및 리뷰 관리
- **고객 신뢰**: 리뷰 시스템을 통한 서비스 품질 검증

### 타겟 사용자
- **고객**: 컨트롤러 수리가 필요한 게이머
- **관리자**: 수리 서비스 운영자 및 기술자

---

## 🏗️ 현재 시스템 구조

### 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────────────┐  ┌──────────────────────────┐     │
│  │   Customer App      │  │     Admin Panel          │     │
│  │  - 수리 신청 플로우  │  │  - 서비스 관리           │     │
│  │  - 서비스 브라우징  │  │  - 수리 요청 관리        │     │
│  │  - 리뷰 시스템      │  │  - 리뷰 승인             │     │
│  └─────────────────────┘  └──────────────────────────┘     │
│         │                           │                        │
│         └───────────┬───────────────┘                        │
│                     │                                        │
│              ┌──────▼───────┐                               │
│              │   API Layer   │                               │
│              │  (lib/api.ts) │                               │
│              └──────┬───────┘                               │
└─────────────────────┼──────────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │   Supabase     │
              │   PostgreSQL   │
              │   + Storage    │
              │   + Auth       │
              └────────────────┘
```

### 디렉토리 구조

```
src/
├── admin/                     # 관리자 패널
│   ├── AdminApp.tsx          # 관리자 앱 진입점
│   ├── contexts/             # Auth 컨텍스트
│   ├── components/           # 공통 컴포넌트
│   │   ├── AddServiceModal.tsx
│   │   ├── EditServiceModal.tsx
│   │   └── ServiceOptionsModal.tsx
│   └── pages/                # 관리 페이지
│       ├── Dashboard.tsx     # 대시보드
│       ├── ServicesPage.tsx  # 서비스 관리
│       ├── ControllersPage.tsx
│       ├── RepairsPage.tsx   # 수리 요청 관리
│       ├── ReviewsPage.tsx   # 리뷰 관리
│       └── PricingPage.tsx   # 가격 설정
│
├── app/                       # 고객용 앱
│   ├── App.tsx               # 앱 라우터
│   ├── components/           # 앱 컴포넌트
│   │   ├── HomeScreen.tsx    # 랜딩 페이지
│   │   ├── ControllerSelection.tsx  # 1단계
│   │   ├── ServiceSelection.tsx     # 2단계
│   │   ├── RepairForm.tsx           # 3단계
│   │   ├── ServicesPage.tsx         # 서비스 목록
│   │   ├── ReviewsPage.tsx          # 리뷰 페이지
│   │   └── ui/               # Shadcn UI 컴포넌트
│   └── pages/
│       └── ReviewPage.tsx    # 토큰 기반 리뷰 제출
│
├── hooks/                     # React Hooks
│   ├── useServices.ts
│   ├── useServicesWithPricing.ts
│   ├── useRepairRequest.ts
│   └── useReviews.ts
│
├── lib/                       # 핵심 라이브러리
│   ├── api.ts                # API 함수
│   ├── supabase.ts           # Supabase 클라이언트
│   └── reviewUtils.ts        # 리뷰 유틸
│
├── services/
│   └── pricingService.ts     # 가격 계산 로직
│
├── types/                     # TypeScript 타입
│   ├── database.ts
│   └── supabase-generated.ts
│
└── utils/
    └── controllerModels.ts   # 컨트롤러 모델 매핑
```

---

## 🗄️ 데이터베이스 스키마 분석

### 핵심 테이블 관계도

```
controller_models (컨트롤러 모델)
    │
    ├──> controller_services (컨트롤러별 서비스)
    │       │
    │       └──> controller_service_options (서비스 옵션)
    │
    └──> repair_requests (수리 요청)
            │
            ├──> repair_request_services (선택된 서비스)
            ├──> reviews (고객 리뷰)
            └──> status_history (상태 변경 이력)
```

### 주요 테이블 설명

#### 1. **controller_models**
컨트롤러 기본 정보 관리
- DualSense, DualSense Edge, DualShock 4, Joy-Con 등
- `display_order`로 표시 순서 제어
- `is_active`로 활성화/비활성화 관리

#### 2. **controller_services**
**컨트롤러별 독립적인 서비스 관리**
- 각 컨트롤러 모델마다 별도의 서비스 세트
- 서비스 상세 정보:
  - `name`, `description`, `subtitle`, `detailed_description`
  - `base_price`: 기본 가격
  - `duration`: 예상 소요 시간 (예: "1일", "2-3일")
  - `warranty`: 보증 기간 (예: "1년", "6개월")
  - `features`: JSONB 배열 (서비스 특징)
  - `process_steps`: JSONB 배열 (작업 과정)
  - `image_url`: 서비스 이미지
- `display_order`로 표시 순서 제어
- `is_active`로 활성화/비활성화 관리

**설계 의도**:
컨트롤러마다 제공 가능한 서비스가 다르고, 같은 서비스라도 가격과 작업 내용이 다를 수 있어 독립적으로 관리

#### 3. **controller_service_options**
서비스 추가 옵션 관리
- 서비스별 선택 가능한 옵션 (예: "기본형", "굴리킷 TMR")
- `additional_price`: 추가 비용
- `display_order`로 표시 순서 제어
- `is_active`로 소프트 삭제 (외래 키 제약 조건 문제 해결)

#### 4. **repair_requests**
고객 수리 요청
- 고객 정보: `customer_name`, `customer_phone`, `customer_email`
- `controller_model`: 선택한 컨트롤러 (FK)
- `issue_description`: 문제 설명
- `status`: 진행 상태
  - `pending` (대기)
  - `confirmed` (확인됨)
  - `in_progress` (진행 중)
  - `completed` (완료)
  - `cancelled` (취소)
- `total_amount`: 총 비용
- `estimated_completion_date`, `actual_completion_date`: 완료 예정일/실제 완료일
- `pre_repair_notes`, `post_repair_notes`: 수리 전/후 메모
- `review_token`: 리뷰 작성용 토큰 (nanoid)
- `review_sent_at`: 리뷰 요청 발송 시간

#### 5. **repair_request_services**
수리 요청 내 선택된 서비스 (Line Items)
- `service_id`: 선택된 서비스 (FK)
- `selected_option_id`: 선택된 옵션 (nullable FK)
- `service_price`, `option_price`: 주문 시점의 가격 (불변)

**설계 의도**:
가격이 나중에 변경되어도 과거 주문의 가격은 유지되어야 함

#### 6. **reviews**
고객 리뷰 시스템
- `repair_request_id`: 연결된 수리 요청 (nullable)
- `customer_name`: 고객 이름
- `rating`: 별점 (1-5)
- `content`: 리뷰 내용
- `service_name`: 서비스 이름
- `image_url`: 리뷰 이미지
- `is_approved`: 관리자 승인 여부
- `is_public`: 공개 여부

#### 7. **status_history**
수리 상태 변경 이력 (Audit Trail)
- `previous_status` → `new_status`
- `changed_by`: 변경한 관리자
- `notes`: 변경 사유
- `created_at`: 변경 시각

#### 8. **service_combos**
서비스 묶음 할인
- `combo_name`: 콤보 이름
- `discount_type`: 할인 유형 (`percentage` | `fixed`)
- `discount_value`: 할인 값
- `required_service_ids`: 필요한 서비스 ID 배열
- `is_active`: 활성화 여부

#### 9. **admin_users**
관리자 인증
- `email`, `password_hash`
- `is_active`: 계정 활성화 여부

#### 10. ~~**controller_service_pricing**~~ (✅ 삭제됨)
~~컨트롤러별 서비스 가격 오버라이드 테이블~~
- **2026-01-26 삭제** - 더 이상 사용되지 않음

#### 11. ~~**controller_option_pricing**~~ (✅ 삭제됨)
~~컨트롤러별 옵션 가격 오버라이드 테이블~~
- **2026-01-26 삭제** - 더 이상 사용되지 않음

### 스키마 변경 이력 (최근 마이그레이션)

```sql
025_add_controller_service_options_display_order.sql
  - 옵션 표시 순서 추가

027_migrate_services_to_controller_services.sql
  - 기존 services 테이블에서 controller_services로 마이그레이션
  - 컨트롤러별 독립적인 서비스 관리 체계로 전환

028_verify_migration.sql
  - 마이그레이션 검증

029_cleanup_orphaned_services.sql
  - 고아 서비스 정리

030_force_migrate_027.sql
  - 강제 마이그레이션

031_drop_legacy_tables.sql
  - 레거시 테이블 삭제 (services, service_options)

032_fix_repair_request_controller_fk.sql
  - repair_requests.controller_model FK 수정

033_add_repair_notes_columns.sql
  - pre_repair_notes, post_repair_notes 추가

034_remove_unused_pricing_tables.sql
  - controller_service_pricing 테이블 삭제
  - controller_option_pricing 테이블 삭제
```

---

## ✅ 구현된 주요 기능

### 고객용 기능

#### 1. **수리 신청 플로우 (3단계)**

**1단계: 컨트롤러 선택**
- 지원하는 컨트롤러 모델 표시
- 각 모델별 아이콘 및 설명
- 선택 시 다음 단계로 진행

**2단계: 서비스 선택**
- 선택한 컨트롤러에서 제공 가능한 서비스 목록
- 각 서비스의 기본 가격 표시
- 서비스 옵션 선택 (추가 비용)
- 실시간 총액 계산
- 서비스 콤보 할인 자동 적용

**3단계: 고객 정보 입력**
- 이름, 전화번호, 이메일
- 주소 입력 (우편번호, 기본 주소, 상세 주소)
- 픽업 방법 선택 (택배/편의점 반택 등)
- 문제 설명
- 주문 확인 및 제출

#### 2. **서비스 브라우징**
- 제공 서비스 상세 페이지
- 서비스별 아이콘, 이미지, 설명
- 소요 시간, 보증 기간, 특징, 작업 과정 표시
- 서비스 상세 모달

#### 3. **리뷰 시스템**
- 홈 화면에서 공개 승인된 리뷰 표시
- 평균 별점 표시
- 리뷰 작성 (토큰 기반)
  - 수리 완료 후 카카오톡으로 리뷰 링크 발송
  - `/review/:token` 경로로 접근
  - 별점(1-5), 리뷰 내용, 이미지 첨부
- 리뷰 이미지 Supabase Storage 업로드

#### 4. **반응형 디자인**
- 모바일 퍼스트 디자인
- Progressive Web App (PWA) 지원
- Capacitor 통합으로 네이티브 앱 지원 준비

### 관리자 기능

#### 1. **대시보드**
- 수리 요청 현황 (전체/대기/진행중/완료)
- 월별 매출 및 완료 건수
- 평균 고객 평점
- 최근 수리 요청 목록
- 최근 리뷰 목록

#### 2. **서비스 관리**
- 컨트롤러 선택 후 서비스 목록 표시
- 서비스 추가/수정/삭제
- 드래그 앤 드롭으로 표시 순서 변경
- 서비스 활성화/비활성화 토글
- 서비스 이미지 업로드
- 서비스 상세 정보 입력
  - 이름, 설명, 부제, 상세 설명
  - 기본 가격
  - 소요 시간, 보증 기간
  - 특징 리스트, 작업 과정 리스트
  - 아이콘 선택
- 서비스 옵션 관리
  - 옵션 추가/수정/삭제 (소프트 삭제)
  - 옵션명, 설명, 추가 가격
  - 드래그 앤 드롭으로 표시 순서 변경
  - 인라인 편집 모드

#### 3. **컨트롤러 관리**
- 컨트롤러 모델 추가/수정/삭제
- 표시 순서 변경
- 활성화/비활성화

#### 4. **수리 요청 관리**
- 전체 수리 요청 목록
- 검색 (고객 이름/전화번호)
- 필터링 (상태별)
- 수리 상태 변경
- 관리자 메모 추가
- 수리 전/후 메모 작성
- 완료 예정일 설정
- 리뷰 토큰 생성 및 카카오톡 발송
- 상태 변경 이력 조회

#### 5. **리뷰 관리**
- 제출된 리뷰 목록
- 승인/거부
- 공개/비공개 토글
- 고객 이름 마스킹 (프라이버시)

#### 6. **인증 시스템**
- 이메일/비밀번호 로그인
- AuthContext를 통한 세션 관리
- 보호된 관리자 라우트

---

## 🔄 최근 변경 사항

### 주요 구조 변경

#### **컨트롤러별 독립 서비스 관리 체계**
- 기존 `services` 테이블 → `controller_services` 테이블로 마이그레이션
- 각 컨트롤러 모델별로 독립적인 서비스 세트 관리
- `service_options` → `controller_service_options`로 변경
- 관리자 UI를 컨트롤러 선택 후 서비스 관리 방식으로 개편

**변경 이유**:
- 컨트롤러마다 제공 가능한 서비스가 다름
- 동일한 서비스라도 컨트롤러별로 가격/작업 내용 차이
- 더 유연하고 확장 가능한 구조

### 기능 개선

1. **서비스 옵션 삭제 로직 개선**
   - 실제 삭제 → 소프트 삭제 (`is_active = false`)
   - 이유: `repair_request_services`가 옵션을 참조하고 있어 외래 키 제약 조건 위반
   - 과거 주문 데이터 보존

2. **서비스 옵션 편집 UI 개선**
   - 간단한 prompt → 인라인 편집 모드
   - 옵션명, 설명, 가격 모두 수정 가능
   - 드래그 앤 드롭 순서 변경 지원

3. **서비스 이미지 업로드**
   - URL 입력 → 직접 이미지 업로드
   - Supabase Storage `service-images` 버킷 사용
   - 파일 크기/타입 검증
   - 이미지 미리보기

4. **서비스 정렬 수정**
   - `created_at` → `display_order`로 정렬
   - 관리자 설정 순서대로 표시

5. **수리 메모 추가**
   - 수리 전 메모 (`pre_repair_notes`)
   - 수리 후 메모 (`post_repair_notes`)
   - 고객에게 수리 내역 전달 가능

---

## ⚠️ 발견된 문제점 및 개선 사항

### 🔴 긴급 (Critical)

#### 1. ~~**레거시 테이블 정리 필요**~~ (✅ 완료 - 2026-01-26)

**완료 내역**:
- ✅ 가격 설정 페이지는 관리자 메뉴에서 제거됨
- ✅ `controller_service_pricing` 테이블 삭제 완료
- ✅ `controller_option_pricing` 테이블 삭제 완료
- ✅ 마이그레이션 파일 작성 및 실행 (034_remove_unused_pricing_tables.sql)

**결과**:
현재 시스템은 `controller_services.base_price`와 `controller_service_options.additional_price`를 직접 사용하며, 불필요한 레거시 테이블이 제거되어 데이터베이스 구조가 간소화되었습니다.

#### 2. ~~**외래 키 제약 조건 이슈**~~ (✅ 완료 - 2026-01-26)

**완료 내역**:
- ✅ 서비스 삭제를 소프트 삭제로 변경 (`is_active = false`)
- ✅ 서비스 옵션 삭제도 소프트 삭제로 이미 적용됨
- ✅ 비활성화된 서비스/옵션은 관리자 UI에서 필터링되어 표시되지 않음
- ✅ 과거 주문 데이터 보존됨

**결과**:
외래 키 제약 조건 위반 없이 서비스와 옵션을 안전하게 "삭제"(비활성화)할 수 있으며, 과거 주문 데이터의 무결성이 보장됩니다.

### 🟡 높음 (High Priority)

#### 4. ~~**타입 불일치**~~ (✅ 완료 - 2026-01-26)

**완료 내역**:
- ✅ `npm run types:generate` 스크립트 추가
- ✅ Supabase CLI를 사용한 자동 타입 생성 설정
- ✅ `.env.example`에 `SUPABASE_PROJECT_ID` 문서화
- ✅ `docs/TYPE_GENERATION.md` 가이드 작성
  - 타입 생성 방법
  - 사용법
  - 트러블슈팅
  - 모범 사례

**사용 방법**:
```bash
# .env에 SUPABASE_PROJECT_ID 설정 후
npm run types:generate
```

**결과**:
마이그레이션 실행 후 타입을 자동으로 재생성할 수 있어, 타입 불일치 문제가 해결되었습니다.

#### 5. **리뷰 토큰 보안**

**문제점**:
- 리뷰 토큰이 짧고 단순 (nanoid)
- 토큰 만료 기능 없음
- 누구나 토큰만 알면 리뷰 작성 가능

**해결 방안**:
- 토큰 만료 시간 추가 (`token_expires_at`)
- 토큰 길이 증가
- 이미 리뷰 작성된 토큰은 재사용 불가 처리

#### 6. **이미지 최적화 부족**

**문제점**:
- 업로드된 이미지를 원본 크기로 저장
- 대용량 이미지 시 로딩 속도 저하

**해결 방안**:
- 이미지 리사이징 (프론트엔드 또는 Supabase Edge Function)
- WebP 포맷 변환
- 썸네일 생성

#### 7. **검색 및 필터링 기능 부족**

**문제점**:
- 수리 요청은 검색/필터 가능하지만 기능이 제한적
- 서비스, 컨트롤러, 리뷰 등에는 검색 기능 없음
- 날짜 범위 필터, 가격 범위 필터 등 부재

**해결 방안**:
- Supabase Full-Text Search 사용
- 고급 필터링 UI 추가
- 날짜 피커를 통한 기간 검색

### 🟢 중간 (Medium Priority)

#### 8. **에러 핸들링 및 로딩 상태 개선**

**문제점**:
- 일부 컴포넌트에서 에러 처리 불충분
- 로딩 스피너가 일관되지 않음
- 사용자에게 명확한 피드백 부족

**해결 방안**:
- 공통 에러 처리 컴포넌트
- 통일된 로딩 인디케이터
- Toast 알림 일관성 개선

#### 9. **성능 최적화**

**문제점**:
- 일부 페이지에서 불필요한 리렌더링
- 큰 데이터 목록 시 가상화 미적용
- 이미지 지연 로딩 미적용

**해결 방안**:
- React.memo, useMemo, useCallback 활용
- React Virtual 또는 TanStack Virtual 사용
- Lazy loading for images

#### 10. **테스트 부재**

**문제점**:
- 유닛 테스트, 통합 테스트 없음
- 수동 테스트에 의존

**해결 방안**:
- Vitest + React Testing Library 설정
- 핵심 비즈니스 로직 테스트 (가격 계산, 할인 적용 등)
- E2E 테스트 (Playwright)

#### 11. **접근성 (Accessibility) 개선**

**문제점**:
- 키보드 네비게이션 일부 제한
- 스크린 리더 지원 불충분
- ARIA 속성 누락

**해결 방안**:
- Radix UI는 이미 접근성 지원하지만 커스텀 컴포넌트 개선 필요
- axe-core로 자동화된 접근성 테스트
- 키보드 단축키 추가

### 🔵 낮음 (Low Priority)

#### 12. **다국어 지원 (i18n)**

**현재**: 한국어로만 하드코딩

**해결 방안**:
- react-i18next 또는 next-intl 사용
- 한국어/영어 지원

#### 13. **분석 및 추적**

**현재**: 사용자 행동 추적 없음

**해결 방안**:
- Google Analytics 또는 Mixpanel 연동
- 수리 신청 퍼널 분석
- 주요 이벤트 트래킹 (서비스 선택, 주문 완료 등)

#### 14. **SEO 최적화**

**문제점**:
- SPA 구조로 SEO 약함
- 메타 태그 최적화 부족

**해결 방안**:
- React Helmet 또는 react-snap 사용
- 주요 페이지 pre-rendering
- Open Graph 메타 태그 추가

---

## 🚀 향후 개발 계획

### ~~Phase 1: 긴급 수정~~ (✅ 완료 - 2026-01-26)

#### 1.1 레거시 테이블 정리 ✅
- [x] 가격 설정 페이지 제거 (완료)
- [x] `controller_service_pricing` 테이블 삭제 (완료)
- [x] `controller_option_pricing` 테이블 삭제 (완료)
- [x] 마이그레이션 파일 작성 (034_remove_unused_pricing_tables.sql) (완료)

#### 1.2 서비스 삭제 로직 개선 ✅
- [x] 서비스 소프트 삭제 구현 (완료)
- [x] 비활성화된 서비스 필터링 (완료)
- [x] EditServiceModal 메시지 업데이트 (완료)

#### 1.3 타입 시스템 정리 ✅
- [x] Supabase CLI로 자동 타입 생성 스크립트 추가 (완료)
- [x] `package.json`에 `types:generate` 명령어 추가 (완료)
- [x] `.env.example`에 `SUPABASE_PROJECT_ID` 문서화 (완료)
- [x] `docs/TYPE_GENERATION.md` 가이드 작성 (완료)

### Phase 2: 핵심 기능 개선 (2-3주)

#### 2.1 이미지 최적화
- [ ] 이미지 업로드 시 리사이징
- [ ] WebP 변환
- [ ] 썸네일 자동 생성
- [ ] Lazy loading 적용

#### 2.2 검색 및 필터링 강화
- [ ] Full-Text Search 구현
- [ ] 날짜 범위 필터
- [ ] 가격 범위 필터
- [ ] 고급 검색 UI

#### 2.3 리뷰 시스템 보안 강화
- [ ] 토큰 만료 기능 추가
- [ ] 토큰 재사용 방지
- [ ] 리뷰 작성 완료 플래그

#### 2.4 에러 핸들링 개선
- [ ] 공통 에러 바운더리
- [ ] 통일된 로딩 UI
- [ ] 사용자 친화적 에러 메시지

### Phase 3: 성능 및 품질 (3-4주)

#### 3.1 성능 최적화
- [ ] 컴포넌트 메모이제이션
- [ ] 가상 스크롤링 (큰 목록)
- [ ] 코드 스플리팅
- [ ] 번들 사이즈 최적화

#### 3.2 테스트 작성
- [ ] Vitest 설정
- [ ] 유닛 테스트 (가격 계산, 할인 로직)
- [ ] 컴포넌트 테스트
- [ ] E2E 테스트 (주문 플로우)

#### 3.3 접근성 개선
- [ ] 키보드 네비게이션 강화
- [ ] ARIA 속성 추가
- [ ] 자동화된 접근성 테스트

### Phase 4: 확장 기능 (4-8주)

#### 4.1 알림 시스템
- [ ] 수리 상태 변경 시 SMS/이메일 알림
- [ ] 카카오톡 알림 연동
- [ ] 관리자 푸시 알림

#### 4.2 대시보드 강화
- [ ] 매출 그래프 (일별/주별/월별)
- [ ] 서비스별 인기도 분석
- [ ] 컨트롤러별 수리 통계
- [ ] 고객 만족도 추이

#### 4.3 고객 계정 시스템
- [ ] 고객 회원가입/로그인
- [ ] 주문 이력 조회
- [ ] 즐겨찾기 서비스
- [ ] 재주문 기능

#### 4.4 결제 연동
- [ ] 토스페이먼츠 또는 아임포트 연동
- [ ] 선결제 옵션
- [ ] 결제 내역 관리

#### 4.5 재고 관리
- [ ] 부품 재고 추적
- [ ] 재고 부족 알림
- [ ] 부품별 사용 이력

#### 4.6 직원 관리
- [ ] 기술자 계정 추가
- [ ] 작업 할당 시스템
- [ ] 기술자별 작업 통계

### Phase 5: 마케팅 및 분석 (지속적)

#### 5.1 분석 도구 연동
- [ ] Google Analytics 4
- [ ] 전환 추적 (주문 완료)
- [ ] 유입 경로 분석

#### 5.2 SEO 최적화
- [ ] 메타 태그 최적화
- [ ] 구조화된 데이터 (Schema.org)
- [ ] Sitemap 생성

#### 5.3 다국어 지원
- [ ] i18n 라이브러리 설정
- [ ] 한국어/영어 번역
- [ ] 언어 전환 UI

#### 5.4 마케팅 기능
- [ ] 쿠폰/프로모션 코드
- [ ] 추천인 프로그램
- [ ] 이메일 마케팅 연동

---

## 🛠️ 기술 스택 및 의존성

### Frontend

#### Core
- **React 18.3.1** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **React Router 7.12.0** - 라우팅
- **Vite 6.3.5** - 빌드 도구

#### Styling
- **Tailwind CSS 4.1.12** - 유틸리티 스타일링
- **Shadcn/ui** - 컴포넌트 라이브러리
- **Radix UI** - 접근성 우선 프리미티브
- **Lucide React 0.487.0** - 아이콘

#### Interactions
- **dnd-kit** - 드래그 앤 드롭
- **React Hook Form 7.55.0** - 폼 관리
- **Motion 12.23.24** - 애니메이션

#### UI Components
- **Sonner 2.0.3** - Toast 알림
- **Recharts 2.15.2** - 차트

### Backend & Database

- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL 데이터베이스
  - 인증
  - 스토리지 (이미지 업로드)
  - Realtime (향후 사용 가능)
- **@supabase/supabase-js 2.91.0** - JavaScript 클라이언트

### Mobile

- **Capacitor 6.2.0** - 네이티브 iOS/Android 브릿지
- **Vite PWA 0.21.2** - Progressive Web App
- **Workbox** - Service Worker 캐싱

### Build & Tooling

- **Vite 6.3.5** - 빌드 도구
- **@vitejs/plugin-react** - React 플러그인
- **ESLint + Prettier** - 코드 품질
- **TypeScript** - 정적 타입 체크

### Utilities

- **nanoid** - 고유 ID 생성 (리뷰 토큰)
- **date-fns 3.6.0** - 날짜 유틸리티
- **clsx/tailwind-merge** - CSS 유틸리티

---

## 📊 데이터베이스 통계 (추정)

### 테이블 크기 예상 (1년 운영 기준)

| 테이블 | 예상 레코드 수 | 설명 |
|--------|---------------|------|
| `controller_models` | 10-20 | 컨트롤러 모델 (천천히 증가) |
| `controller_services` | 100-200 | 모델당 10-20개 서비스 |
| `controller_service_options` | 200-500 | 서비스당 2-5개 옵션 |
| `repair_requests` | 5,000-10,000 | 일 15-30건 기준 |
| `repair_request_services` | 10,000-30,000 | 요청당 2-3개 서비스 |
| `reviews` | 2,000-5,000 | 완료 건의 40-50% |
| `status_history` | 20,000-40,000 | 요청당 4-5회 상태 변경 |
| `service_combos` | 5-10 | 콤보 이벤트 |
| `admin_users` | 5-10 | 관리자 및 기술자 |

### 인덱스 최적화 권장

```sql
-- 자주 조회되는 컬럼에 인덱스 추가
CREATE INDEX idx_repair_requests_status ON repair_requests(status);
CREATE INDEX idx_repair_requests_created_at ON repair_requests(created_at);
CREATE INDEX idx_reviews_is_public_is_approved ON reviews(is_public, is_approved);
CREATE INDEX idx_controller_services_controller_model_id ON controller_services(controller_model_id);
```

---

## 🔒 보안 고려사항

### 현재 보안 상태

#### ✅ 구현됨
- Row Level Security (RLS) 일부 테이블에 설정
- 관리자 인증 (이메일/비밀번호)
- 비밀번호 해싱
- Supabase Storage 접근 제어

#### ⚠️ 개선 필요
- RLS 정책 재검토 (일부 테이블 비활성화됨)
- 리뷰 토큰 보안 강화
- CORS 설정 확인
- API Rate Limiting 부재
- SQL Injection 방어 (Supabase 기본 제공하지만 추가 검증 필요)
- XSS 방어 (React 기본 제공하지만 innerHTML 사용 주의)

### 권장 보안 조치

1. **RLS 활성화**
   ```sql
   ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
   ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
   ```

2. **관리자 2FA 추가**
   - Supabase Auth MFA 활성화

3. **API Rate Limiting**
   - Supabase Edge Functions에서 처리
   - 또는 Cloudflare Workers

4. **환경 변수 보안**
   - `.env` 파일을 Git에서 제외 (이미 `.gitignore`에 있음)
   - Supabase anon key vs service role key 구분 사용

---

## 📝 결론 및 다음 단계

### 프로젝트 현황 요약

**PandaDuckPix**는 컨트롤러 수리 서비스를 제공하는 기능적으로 완성된 플랫폼입니다. 최근 컨트롤러별 독립 서비스 관리 체계로 전환하여 유연성과 확장성이 크게 향상되었습니다.

### 강점
- ✅ 명확한 사용자 플로우 (3단계 수리 신청)
- ✅ 컨트롤러별 맞춤 서비스 관리
- ✅ 직관적인 관리자 대시보드
- ✅ 리뷰 시스템을 통한 신뢰 구축
- ✅ 모바일 친화적 디자인
- ✅ 드래그 앤 드롭 순서 변경
- ✅ 이미지 업로드 지원

### 개선 필요
- 🔴 가격 설정 페이지 재구축 (긴급)
- 🔴 타입 시스템 정리
- 🟡 이미지 최적화
- 🟡 검색 기능 강화
- 🟢 성능 최적화
- 🟢 테스트 작성

### 즉시 착수 권장
1. **레거시 테이블 정리** (데이터베이스 정리)
2. **타입 자동 생성** (유지보수성 향상)
3. **서비스 소프트 삭제** (데이터 무결성)

### 중장기 목표
- 알림 시스템 (SMS/카카오톡)
- 결제 연동
- 고객 계정 시스템
- 재고 관리
- 직원 관리
- 분석 도구 연동

---

**문서 작성일**: 2026-01-26
**작성자**: Claude (AI Assistant)
**프로젝트 버전**: 개발 중
**다음 리뷰**: Phase 1 완료 후
