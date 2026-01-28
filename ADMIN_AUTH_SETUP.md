# Admin Authentication Setup Guide

## 개요
이 가이드는 Supabase Auth를 사용한 보안 강화된 관리자 로그인 시스템 설정 방법을 설명합니다.

---

## 🔐 보안 개선 사항

### 1. **Supabase Auth 사용**
- JWT 토큰 기반 인증
- 비밀번호 bcrypt 해싱 (자동)
- 서버 측 세션 검증
- 토큰 자동 갱신

### 2. **Rate Limiting**
- 15분 동안 최대 5회 로그인 시도 제한
- 초과 시 자동 차단 (클라이언트 측)

### 3. **Session Timeout**
- 8시간 비활성 시 자동 로그아웃
- 사용자 활동 감지 (마우스, 키보드, 스크롤, 터치)

### 4. **Login Attempt Logging**
- 모든 로그인 시도 기록
- 성공/실패 여부 추적
- IP 주소 및 User Agent 기록
- 에러 메시지 저장

### 5. **기타 보안**
- HTTPS 강제 (프로덕션)
- Row Level Security (RLS) 활성화
- 최소 비밀번호 길이: 6자

---

## 📋 설정 단계

### Step 1: SQL 마이그레이션 실행

Supabase Dashboard → SQL Editor에서 다음 SQL들을 순서대로 실행:

#### 1-1. 로그인 로그 테이블 생성

```sql
-- supabase/migrations/create_admin_login_logs.sql 파일 내용 복사하여 실행
```

### Step 2: Supabase Auth 설정

#### 2-1. Authentication 활성화
1. Supabase Dashboard → Authentication → Settings
2. "Enable Email Signup" 확인
3. "Enable Email Confirmations" 비활성화 (관리자는 수동 생성)

#### 2-2. Email Templates 설정 (선택사항)
- 비밀번호 재설정 이메일 템플릿 커스터마이징
- Authentication → Email Templates

### Step 3: 관리자 계정 생성

#### 3-1. Supabase Dashboard에서 생성

1. Authentication → Users 메뉴로 이동
2. "Add user" → "Create new user" 클릭
3. 이메일 입력: `admin@pandaduckfix.com`
4. 비밀번호 입력: 강력한 비밀번호 설정
5. "Auto Confirm User" 체크 (이메일 확인 건너뛰기)
6. "Create user" 클릭

#### 3-2. SQL로 생성 (대안)

```sql
-- Supabase SQL Editor에서 실행
-- 비밀번호는 자동으로 해싱됩니다
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@pandaduckfix.com',
  crypt('your-strong-password', gen_salt('bf')), -- bcrypt 해싱
  NOW(),
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  NOW()
);
```

### Step 4: 기존 admin_users 테이블 처리

기존의 `admin_users` 테이블은 더 이상 사용되지 않습니다.

#### 옵션 1: 테이블 삭제 (권장)
```sql
DROP TABLE IF EXISTS admin_users CASCADE;
```

#### 옵션 2: 테이블 보관 (감사 목적)
```sql
-- 테이블 이름 변경하여 보관
ALTER TABLE admin_users RENAME TO admin_users_deprecated;
COMMENT ON TABLE admin_users_deprecated IS 'Deprecated - Using Supabase Auth now';
```

### Step 5: 환경 변수 확인

`.env` 파일에서 Supabase 설정 확인:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🧪 테스트

### 1. 로그인 테스트
```
1. http://localhost:5173/admin 접속
2. 생성한 관리자 이메일/비밀번호로 로그인
3. 로그인 성공 확인
```

### 2. Rate Limiting 테스트
```
1. 잘못된 비밀번호로 5번 시도
2. "로그인 시도 횟수를 초과했습니다" 메시지 확인
3. 15분 대기 후 다시 시도 가능
```

### 3. Session Timeout 테스트
```
1. 로그인 후 8시간 대기 (또는 코드에서 SESSION_TIMEOUT 값을 1분으로 줄여서 테스트)
2. 자동 로그아웃 확인
```

### 4. 로그 확인
```sql
-- Supabase SQL Editor에서 로그인 로그 확인
SELECT * FROM admin_login_logs
ORDER BY timestamp DESC
LIMIT 10;
```

---

## 🔧 설정 커스터마이징

### Session Timeout 변경
`src/admin/contexts/AuthContext.tsx`:
```typescript
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000 // 8시간 (밀리초)
```

### Rate Limiting 변경
`src/admin/contexts/AuthContext.tsx`:
```typescript
const MAX_LOGIN_ATTEMPTS = 5 // 최대 시도 횟수
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15분 (밀리초)
```

### 비밀번호 최소 길이 변경
`src/admin/components/LoginPage.tsx`:
```tsx
<input
  type="password"
  minLength={6} // 여기를 변경
  ...
/>
```

---

## 🚨 중요 보안 권고사항

### 프로덕션 배포 전 확인사항

1. **HTTPS 강제**
   - Vercel/Netlify 등 호스팅에서 HTTPS 강제 설정
   - HTTP → HTTPS 자동 리다이렉트 활성화

2. **Supabase Row Level Security (RLS)**
   - 모든 테이블에 RLS 정책 적용
   - admin_login_logs 테이블 RLS 활성화 확인

3. **환경 변수 보안**
   - `.env` 파일을 `.gitignore`에 추가
   - 프로덕션 환경 변수를 호스팅 서비스에 안전하게 설정

4. **비밀번호 정책**
   - 관리자는 강력한 비밀번호 사용 (최소 12자, 대소문자/숫자/특수문자 포함)
   - 정기적인 비밀번호 변경 권장

5. **2FA 추가 고려**
   - Supabase에서 2FA (Two-Factor Authentication) 지원
   - Authentication → Settings → Enable 2FA

6. **IP 화이트리스트 (선택사항)**
   - 특정 IP에서만 관리자 접근 허용
   - Supabase → Settings → API → Restrictions

7. **정기적인 로그 모니터링**
   - 실패한 로그인 시도 확인
   - 의심스러운 활동 감지

---

## 📊 로그인 로그 모니터링

### 실패한 로그인 시도 확인
```sql
SELECT
  email,
  COUNT(*) as failed_attempts,
  MAX(timestamp) as last_attempt
FROM admin_login_logs
WHERE success = FALSE
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY email
HAVING COUNT(*) > 3
ORDER BY failed_attempts DESC;
```

### 특정 사용자 로그인 이력
```sql
SELECT
  email,
  success,
  ip_address,
  user_agent,
  error_message,
  timestamp
FROM admin_login_logs
WHERE email = 'admin@pandaduckfix.com'
ORDER BY timestamp DESC
LIMIT 20;
```

---

## 🆘 문제 해결

### 문제: "Invalid login credentials" 에러
- Supabase Dashboard → Authentication → Users에서 사용자 존재 확인
- 이메일 주소 정확히 일치하는지 확인
- "Email Confirmed" 상태 확인

### 문제: Rate Limiting 해제 필요
```javascript
// 브라우저 콘솔에서 실행
localStorage.removeItem('admin_login_attempts')
```

### 문제: 세션이 바로 만료됨
- 브라우저 쿠키 설정 확인
- Third-party cookies 활성화 확인
- Supabase 프로젝트 URL 확인

---

## 📝 마이그레이션 체크리스트

- [ ] `create_admin_login_logs.sql` 실행
- [ ] Supabase Authentication 활성화
- [ ] 관리자 계정 생성
- [ ] 기존 `admin_users` 테이블 처리
- [ ] 환경 변수 확인
- [ ] 로그인 테스트
- [ ] Rate Limiting 테스트
- [ ] Session Timeout 테스트
- [ ] 로그 확인
- [ ] HTTPS 설정 (프로덕션)
- [ ] RLS 정책 확인

---

## 🎉 완료!

이제 보안이 강화된 관리자 로그인 시스템이 준비되었습니다.

문의사항이 있으면 개발팀에 연락하세요.
