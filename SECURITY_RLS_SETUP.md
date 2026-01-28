# Row Level Security (RLS) 설정 가이드

## 🚨 심각한 보안 문제

현재 모든 테이블이 **UNRESTRICTED** 상태입니다. 이는 다음을 의미합니다:

- ✗ 누구나 모든 데이터 조회 가능
- ✗ 누구나 데이터 수정/삭제 가능
- ✗ 고객 개인정보 노출 위험
- ✗ 매출 데이터 노출 위험
- ✗ 관리자 계정 정보 노출 위험

**즉시 RLS를 활성화해야 합니다!**

---

## 📋 RLS 설정 단계

### Step 1: SQL 마이그레이션 실행

Supabase Dashboard → SQL Editor에서 다음 파일 실행:

```
supabase/migrations/enable_rls_policies.sql
```

이 SQL은 다음을 수행합니다:
1. 모든 테이블에 RLS 활성화
2. 공개 읽기 정책 (고객용 데이터)
3. 인증된 사용자 정책 (관리자용)
4. 고객 작성 정책 (수리 신청, 리뷰)

### Step 2: 실행 확인

SQL 실행 후 Supabase Dashboard에서 확인:

1. Database → Tables 메뉴로 이동
2. 각 테이블 클릭
3. "RLS enabled" 상태 확인 ✓
4. "Policies" 탭에서 정책 확인

**모든 테이블이 "RLS enabled" 상태여야 합니다.**

---

## 🔐 RLS 정책 설명

### 공개 읽기 (Public Read)

다음 데이터는 누구나 읽을 수 있습니다:

- **컨트롤러 모델** (활성화된 것만)
- **서비스 목록** (활성화된 것만)
- **서비스 옵션** (활성화된 것만)
- **가격 정보** (사용 가능한 것만)
- **할인 정보** (활성화된 것만)
- **승인된 공개 리뷰** (is_approved=true, is_public=true)

### 고객 작성 (Customer Write)

다음 작업은 누구나 할 수 있습니다:

- **수리 신청 생성** (repair_requests INSERT)
- **리뷰 작성** (reviews INSERT)

### 관리자 전용 (Admin Only)

다음은 **인증된 사용자만** 접근 가능:

- 모든 수리 신청 조회/수정/삭제
- 모든 리뷰 조회/승인/거부/삭제
- 컨트롤러 모델 관리
- 서비스 관리
- 가격 관리
- 할인 관리
- 지출 관리
- 매출 통계 조회
- 로그인 로그 조회

---

## 🧪 테스트

### 1. 공개 데이터 테스트

브라우저 콘솔에서 (로그아웃 상태):

```javascript
// 서비스 목록 조회 (성공해야 함)
const { data, error } = await supabase
  .from('controller_services')
  .select('*')

console.log('Services:', data)
console.log('Error:', error)
```

### 2. 관리자 데이터 테스트

브라우저 콘솔에서 (로그아웃 상태):

```javascript
// 지출 조회 시도 (실패해야 함)
const { data, error } = await supabase
  .from('expenses')
  .select('*')

console.log('Should be empty:', data)
console.log('Should have error:', error) // "row-level security policy"
```

### 3. 고객 작성 테스트

```javascript
// 수리 신청 생성 (성공해야 함)
const { data, error } = await supabase
  .from('repair_requests')
  .insert({
    customer_name: 'Test User',
    customer_phone: '010-1234-5678',
    customer_email: 'test@test.com',
    controller_model: 'some-uuid',
    total_amount: 50000,
    status: 'pending'
  })

console.log('Result:', data, error)
```

---

## ⚠️ 중요 사항

### 1. 수리 신청 조회 정책

현재 `repair_requests`는 모든 사람이 조회 가능합니다:
```sql
CREATE POLICY "Anyone can read repair requests with valid token"
ON repair_requests FOR SELECT
USING (true);
```

**이유**: 고객이 리뷰 페이지(`/review/{token}`)에서 자신의 수리 내역을 확인해야 하기 때문입니다.

**보안 강화 옵션** (더 엄격하게 하려면):
```sql
-- 토큰이 있는 경우만 조회 가능
CREATE POLICY "Users can read requests with valid token"
ON repair_requests FOR SELECT
USING (
  review_token IS NOT NULL OR
  auth.uid() IS NOT NULL
);
```

### 2. 관리자 인증

- Supabase Auth로 로그인한 사용자만 `authenticated` 역할 부여
- 모든 관리자 작업은 JWT 토큰으로 인증
- 토큰 만료 시 자동 로그아웃 (8시간)

### 3. API 키 사용

- **ANON KEY**: 공개 데이터 접근용 (프론트엔드에서 사용)
- **SERVICE ROLE KEY**: 모든 RLS 우회 (서버에서만 사용, 절대 노출 금지!)

---

## 📊 정책 요약표

| 테이블 | 공개 읽기 | 고객 쓰기 | 관리자 전체 |
|--------|----------|----------|------------|
| controller_models | ✓ (활성) | ✗ | ✓ |
| controller_services | ✓ (활성) | ✗ | ✓ |
| controller_service_options | ✓ (활성) | ✗ | ✓ |
| controller_service_pricing | ✓ (사용가능) | ✗ | ✓ |
| controller_option_pricing | ✓ (사용가능) | ✗ | ✓ |
| service_combos | ✓ (활성) | ✗ | ✓ |
| repair_requests | ✓ | ✓ (INSERT) | ✓ |
| repair_request_services | ✓ | ✗ | ✓ |
| reviews | ✓ (승인된 것만) | ✓ (INSERT) | ✓ |
| status_history | ✗ | ✗ | ✓ (읽기/쓰기) |
| expense_categories | ✗ | ✗ | ✓ |
| expenses | ✗ | ✗ | ✓ |
| admin_users | ✗ | ✗ | ✓ (읽기만) |
| admin_login_logs | ✗ | ✓ (INSERT) | ✓ (읽기) |

---

## 🔧 정책 수정 방법

특정 정책을 수정하려면:

```sql
-- 1. 기존 정책 삭제
DROP POLICY "policy_name" ON table_name;

-- 2. 새 정책 생성
CREATE POLICY "new_policy_name"
ON table_name
FOR SELECT
USING (your_condition);
```

---

## 🆘 문제 해결

### 문제: "row-level security policy" 에러

**원인**: RLS 정책이 요청을 차단함

**해결**:
1. 로그인 상태 확인 (관리자 작업 시)
2. 정책 조건 확인 (예: is_active=true)
3. Supabase Dashboard → Database → Policies에서 정책 확인

### 문제: 관리자가 데이터에 접근 불가

**확인 사항**:
1. Supabase Auth로 로그인했는지 확인
2. JWT 토큰이 유효한지 확인 (개발자 도구 → Application → Local Storage)
3. "authenticated" 역할 정책이 있는지 확인

### 문제: 고객이 데이터를 볼 수 없음

**확인 사항**:
1. 공개 읽기 정책이 활성화되었는지 확인
2. 데이터가 조건을 만족하는지 확인 (예: is_active=true)
3. ANON KEY를 사용하는지 확인 (SERVICE ROLE KEY 아님)

---

## ✅ 체크리스트

설정 완료 후 확인:

- [ ] `enable_rls_policies.sql` 실행
- [ ] 모든 테이블 RLS enabled 확인
- [ ] 각 테이블에 정책이 생성되었는지 확인
- [ ] 공개 데이터 조회 테스트 (로그아웃 상태)
- [ ] 관리자 데이터 차단 테스트 (로그아웃 상태)
- [ ] 고객 수리 신청 생성 테스트
- [ ] 관리자 로그인 후 전체 접근 테스트
- [ ] 프론트엔드에서 정상 작동 확인

---

## 🎯 완료!

RLS 설정이 완료되면 데이터베이스가 안전하게 보호됩니다.

**중요**: 프로덕션 배포 전 반드시 RLS를 설정하세요!
