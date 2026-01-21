# Supabase 마이그레이션 가이드

## 마이그레이션 파일 실행 순서

Supabase Dashboard → SQL Editor에서 다음 파일들을 순서대로 실행하세요.

### 1. 기본 스키마 (선택사항 - 이미 실행했다면 스킵)
```sql
-- schema.sql 파일 내용 복사 후 실행
```

### 2. 서비스 콤보 할인 시스템
```sql
-- 002_service_combos.sql 파일 내용 복사 후 실행
```

### 3. 수리 신청 서비스 RLS 정책
```sql
-- 003_repair_request_services_rls.sql 파일 내용 복사 후 실행
```

### 4. 수리 신청 RLS 정책 수정 ⭐ 중요!
```sql
-- 004_fix_repair_requests_rls.sql 파일 내용 복사 후 실행
```

**이 마이그레이션이 반드시 필요합니다!**
- 수리 신청 생성 시 RLS 오류 해결
- 모든 사용자가 수리 신청을 생성할 수 있도록 허용

### 5. NULL 허용 필드 확인
```sql
-- 005_ensure_nullable_fields.sql 파일 내용 복사 후 실행
```

## RLS 오류 해결 방법

만약 "new row violates row-level security policy" 오류가 발생하면:

### 방법 1: 마이그레이션 실행 (권장)
위의 마이그레이션 4번과 5번을 실행하세요.

### 방법 2: 수동으로 RLS 정책 수정
Supabase Dashboard → Authentication → Policies → repair_requests 테이블에서:

1. 기존 정책 삭제:
   - "Anyone can create repair requests" 정책 삭제

2. 새 정책 추가:
   - Policy name: `Enable insert for all users`
   - Policy command: `INSERT`
   - Target roles: `public`
   - USING expression: (비워둠)
   - WITH CHECK expression: `true`

### 방법 3: RLS 임시 비활성화 (개발 환경에만!)
```sql
ALTER TABLE repair_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE repair_request_services DISABLE ROW LEVEL SECURITY;
```

⚠️ **주의**: 프로덕션 환경에서는 RLS를 비활성화하지 마세요!

## 마이그레이션 실행 확인

각 마이그레이션 실행 후 다음 쿼리로 확인:

```sql
-- RLS 정책 확인
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('repair_requests', 'repair_request_services', 'service_combos')
ORDER BY tablename, policyname;

-- 테이블 컬럼 확인
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'repair_requests'
ORDER BY ordinal_position;
```

## 테스트

마이그레이션 완료 후 웹 앱에서 수리 신청을 테스트해보세요:
1. 서비스 선택
2. 고객 정보 입력
3. 수리 신청하기 버튼 클릭
4. Supabase Dashboard → Table Editor → repair_requests에서 데이터 확인

## 문제 해결

### "permission denied for table" 오류
- RLS가 활성화되어 있지만 정책이 없는 경우
- 마이그레이션 3, 4번 실행

### "violates foreign key constraint" 오류
- UUID 참조 문제
- services 테이블에 해당 서비스가 존재하는지 확인

### "column does not exist" 오류
- 스키마가 최신 버전이 아님
- schema.sql 재실행 필요
