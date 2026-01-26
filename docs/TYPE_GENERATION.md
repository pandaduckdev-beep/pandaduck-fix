# 타입 자동 생성 가이드

## 개요

Supabase 데이터베이스 스키마로부터 TypeScript 타입을 자동으로 생성하는 방법을 설명합니다.

## 사전 준비

### 1. Supabase CLI 설치

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# npm
npm install -g supabase
```

### 2. 환경 변수 설정

`.env` 파일에 `SUPABASE_PROJECT_ID`를 추가합니다:

```bash
# .env
SUPABASE_PROJECT_ID=your-project-id-here
```

프로젝트 ID는 Supabase URL에서 추출할 수 있습니다:
- URL 형식: `https://[PROJECT_ID].supabase.co`
- 예: `https://abcdefghijklmnop.supabase.co` → `SUPABASE_PROJECT_ID=abcdefghijklmnop`

## 타입 생성 방법

### 명령어 실행

```bash
npm run types:generate
```

이 명령어는 다음을 수행합니다:
1. Supabase 프로젝트에 연결
2. `public` 스키마의 모든 테이블 정보 가져오기
3. TypeScript 타입 정의를 `src/types/supabase-generated.ts`에 생성

### 생성되는 타입

```typescript
// src/types/supabase-generated.ts
export interface Database {
  public: {
    Tables: {
      controller_models: {
        Row: { /* ... */ }
        Insert: { /* ... */ }
        Update: { /* ... */ }
      }
      controller_services: {
        Row: { /* ... */ }
        Insert: { /* ... */ }
        Update: { /* ... */ }
      }
      // ... 기타 테이블들
    }
  }
}
```

## 타입 사용 방법

### 1. database.ts에서 import

```typescript
// src/types/database.ts
import { Database } from './supabase-generated'

// 기존 수동 타입 정의를 제거하고 자동 생성 타입 사용
export type ControllerModel = Database['public']['Tables']['controller_models']['Row']
export type ControllerService = Database['public']['Tables']['controller_services']['Row']
```

### 2. Supabase 클라이언트에 타입 적용

```typescript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase-generated'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

## 언제 타입을 재생성해야 하나?

다음과 같은 경우 타입을 재생성해야 합니다:

1. **마이그레이션 실행 후**: 새로운 테이블이나 컬럼이 추가된 경우
2. **컬럼 타입 변경**: 기존 컬럼의 데이터 타입이 변경된 경우
3. **테이블 삭제**: 테이블이 삭제된 경우
4. **외래 키 변경**: 관계가 추가되거나 수정된 경우

## 워크플로우 예시

```bash
# 1. 마이그레이션 작성
echo "ALTER TABLE controller_services ADD COLUMN new_field TEXT;" > supabase/migrations/035_add_new_field.sql

# 2. Supabase에 마이그레이션 적용
# (Supabase Dashboard에서 SQL 실행 또는 CLI로 push)

# 3. 타입 재생성
npm run types:generate

# 4. 코드에서 새로운 필드 사용
// TypeScript가 자동으로 새 필드를 인식
```

## 트러블슈팅

### 에러: "Failed to generate types"

**원인**: 잘못된 프로젝트 ID 또는 네트워크 문제

**해결**:
1. `.env` 파일의 `SUPABASE_PROJECT_ID` 확인
2. 인터넷 연결 상태 확인
3. Supabase 프로젝트가 활성 상태인지 확인

### 에러: "Permission denied"

**원인**: Supabase CLI 인증 필요

**해결**:
```bash
supabase login
```

## 모범 사례

1. **버전 관리**: `supabase-generated.ts`를 Git에 커밋하여 팀원과 공유
2. **정기 업데이트**: 주요 마이그레이션 후 즉시 타입 재생성
3. **수동 타입 최소화**: 가능한 자동 생성 타입 사용
4. **타입 별칭**: 복잡한 타입은 `database.ts`에서 별칭 생성

## 참고 자료

- [Supabase CLI 문서](https://supabase.com/docs/guides/cli)
- [TypeScript 타입 생성 가이드](https://supabase.com/docs/guides/api/generating-types)
