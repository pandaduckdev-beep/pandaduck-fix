# PandaDuck Fix - Supabase Database Schema

## 📊 데이터베이스 구조

### 1. **controller_services** (컨트롤러별 서비스 테이블)

각 컨트롤러 모델별로 제공하는 수리/커스터마이징 서비스를 관리합니다.

**주요 필드:**

- `controller_model_id`: 컨트롤러 모델 ID (외래키 → controller_models)
- `service_id`: 고유 서비스 식별자 (예: 'hall-effect', 'clicky-buttons')
- `name`: 서비스명
- `description`: 서비스 설명
- `base_price`: 기본 가격 (원 단위)
- `is_active`: 서비스 활성화 여부
- `display_order`: 표시 순서

**용도:**

- 웹사이트에 표시할 서비스 목록 관리
- 컨트롤러 모델별 다른 서비스/가격 설정
- 관리자가 서비스 정보를 수정/추가/비활성화 가능

---

### 2. **controller_service_options** (컨트롤러 서비스 옵션 테이블)

각 컨트롤러 서비스의 선택 가능한 옵션들을 저장합니다.

**주요 필드:**

- `controller_service_id`: 연결된 컨트롤러 서비스 ID (외래키 → controller_services)
- `option_name`: 옵션명 (예: '기본형', '굴리킷 TMR')
- `option_description`: 옵션 설명
- `additional_price`: 추가 가격
- `display_order`: 표시 순서

**용도:**

- 홀 이펙트 센서의 등급 선택 (기본형, TMR, TMR 720)
- 클릭키 버튼의 강도 선택 (LIGHT, STRONG)
- 백버튼의 개수 선택 (RISE3, RISE4)

---

### 3. **controller_models** (컨트롤러 모델 테이블)

지원하는 컨트롤러 모델을 관리합니다.

**주요 필드:**

- `model_id`: 모델 식별자 (예: 'dualsense', 'dualsense-edge')
- `name`: 모델명
- `is_active`: 활성화 여부
- `display_order`: 표시 순서

---

### 4. **repair_requests** (수리 의뢰 테이블)

고객의 수리 신청 정보를 저장합니다.

**주요 필드:**

- `customer_name`: 고객 이름
- `customer_phone`: 고객 연락처 (필수)
- `customer_email`: 고객 이메일 (선택)
- `controller_model`: 컨트롤러 모델 (DualSense, DualSense Edge 등)
- `issue_description`: 문제 설명
- `status`: 진행 상태
  - `pending`: 접수 대기
  - `confirmed`: 접수 확인
  - `in_progress`: 수리 중
  - `completed`: 완료
  - `cancelled`: 취소
- `total_amount`: 총 금액
- `estimated_completion_date`: 예상 완료일
- `actual_completion_date`: 실제 완료일
- `review_token`: 리뷰 작성용 고유 토큰
- `review_sent_at`: 리뷰 요청 발송 시각

**용도:**

- 고객의 수리 신청 접수
- 진행 상태 추적
- 완료 후 리뷰 요청 발송

---

### 5. **repair_request_services** (수리 의뢰 서비스 상세)

각 의뢰에 포함된 서비스들을 저장합니다.

**주요 필드:**

- `repair_request_id`: 수리 의뢰 ID (외래키)
- `service_id`: 선택한 서비스 ID (controller_services.id)
- `selected_option_id`: 선택한 옵션 ID (controller_service_options.id, nullable)
- `service_price`: 주문 당시 서비스 가격
- `option_price`: 주문 당시 옵션 가격

**용도:**

- 한 번의 의뢰에 여러 서비스 신청 가능
- 가격 변동에도 주문 당시 가격 유지

**예시:**

```
의뢰 #1: 홀 이펙트 (기본형) + 클릭키 버튼 (LIGHT) + 배터리
```

---

### 6. **reviews** (리뷰 테이블)

고객 리뷰를 관리합니다.

**주요 필드:**

- `repair_request_id`: 연결된 수리 의뢰 ID (외래키, nullable)
- `customer_name`: 고객 이름 (일부 마스킹 가능, 예: 김\*수)
- `rating`: 평점 (1~5)
- `content`: 리뷰 내용
- `service_name`: 리뷰 대상 서비스명
- `image_url`: 리뷰 이미지
- `is_approved`: 관리자 승인 여부
- `is_public`: 공개 여부

**용도:**

- 수리 완료 후 고객이 리뷰 작성
- 관리자가 리뷰 승인 후 웹사이트에 공개
- 승인된 리뷰만 공개적으로 조회 가능 (RLS 정책)

---

### 7. **status_history** (상태 변경 이력)

수리 의뢰의 상태 변경을 추적합니다.

**주요 필드:**

- `repair_request_id`: 수리 의뢰 ID (외래키)
- `previous_status`: 이전 상태
- `new_status`: 새로운 상태
- `changed_by`: 변경한 관리자
- `notes`: 변경 메모

**용도:**

- 수리 진행 과정 추적
- 문제 발생 시 이력 조회

---

## 🔐 보안 정책 (Row Level Security)

### 공개 접근 (SELECT)

- `controller_models`: 모든 사용자가 조회 가능
- `controller_services`: 모든 사용자가 조회 가능
- `controller_service_options`: 모든 사용자가 조회 가능
- `reviews`: 승인되고 공개된 리뷰만 조회 가능

### 제한된 접근

- `repair_requests`: 생성만 가능 (INSERT), 조회/수정은 관리자만
- `repair_request_services`: 생성만 가능
- `status_history`: 관리자만 접근 가능

---

## 🔄 워크플로우

### 1. 고객이 수리 신청

```sql
-- 1. 수리 의뢰 생성
INSERT INTO repair_requests (customer_name, customer_phone, controller_model, total_amount, review_token)
VALUES ('홍길동', '010-1234-5678', 'DualSense', 50000, generate_review_token());

-- 2. 선택한 서비스들 저장
INSERT INTO repair_request_services (repair_request_id, service_id, selected_option_id, service_price, option_price)
VALUES
  ('{request_id}', '{hall_effect_controller_service_id}', '{tmr_option_id}', 25000, 15000),
  ('{request_id}', '{clicky_buttons_controller_service_id}', '{light_option_id}', 25000, 0);
```

### 2. 관리자가 상태 변경

```sql
-- 상태 변경 (자동으로 이력 기록)
SELECT change_repair_request_status(
  '{request_id}',
  'in_progress',
  '관리자',
  '작업 시작'
);
```

### 3. 수리 완료 후 리뷰 요청

```sql
-- 완료 처리 및 리뷰 요청 발송 시각 기록
UPDATE repair_requests
SET
  status = 'completed',
  actual_completion_date = CURRENT_DATE,
  review_sent_at = now()
WHERE id = '{request_id}';

-- 고객에게 SMS/카톡 발송:
-- "수리가 완료되었습니다! 리뷰를 작성해주세요: https://pandaduckfix.com/review/{review_token}"
```

### 4. 고객이 리뷰 작성

```sql
-- 토큰으로 의뢰 정보 조회
SELECT * FROM repair_requests
WHERE review_token = '{token}';

-- 리뷰 작성
INSERT INTO reviews (repair_request_id, customer_name, rating, content, service_name)
VALUES ('{request_id}', '김*수', 5, '정말 만족합니다!', '홀 이펙트 센서 업그레이드');
```

### 5. 관리자가 리뷰 승인

```sql
UPDATE reviews
SET is_approved = true, is_public = true
WHERE id = '{review_id}';
```

---

## 📝 초기 데이터

controller_services, controller_service_options 테이블의 초기 데이터는 마이그레이션 파일을 통해 추가됩니다:

- migration 015: controller_models 초기 데이터
- migration 017: controller_services 초기 데이터
- migration 018: controller_service_options 초기 데이터

---

## 🚀 설정 방법

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성
3. 프로젝트 URL과 API Key 복사

### 2. 스키마 실행

1. Supabase Dashboard → SQL Editor
2. `schema.sql` 파일 내용 복사
3. 실행하여 테이블 생성

### 3. 환경 변수 설정

`.env` 파일에 추가:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📱 향후 확장 계획

### Phase 1 (현재)

- ✅ 서비스 관리
- ✅ 수리 의뢰 접수
- ✅ 리뷰 시스템

### Phase 2

- 🔄 실시간 진행 상태 조회 (고객용 토큰)
- 🔄 SMS/카톡 알림 연동
- 🔄 이미지 업로드 (리뷰, 수리 전/후 사진)

### Phase 3

- 📅 예약 시스템
- 👤 회원 가입/로그인
- 📊 통계 대시보드

### Phase 4

- 💳 온라인 결제 연동
- 📦 택배 수거/발송 시스템
- 🎁 포인트/쿠폰 시스템
