# 서비스 콤보 할인 시스템

## 개요
PandaDuck Fix는 여러 서비스를 함께 신청할 경우 자동으로 할인을 적용하는 콤보 시스템을 제공합니다.

## 데이터베이스 구조

### service_combos 테이블
```sql
CREATE TABLE service_combos (
  id UUID PRIMARY KEY,
  combo_name VARCHAR(100),          -- 콤보 이름
  description TEXT,                 -- 할인 설명
  discount_type VARCHAR(20),        -- 'percentage' 또는 'fixed'
  discount_value NUMERIC(10, 2),    -- 할인 값 (% 또는 고정 금액)
  required_service_ids TEXT[],      -- 필요한 서비스 ID 배열
  is_active BOOLEAN,                -- 활성화 여부
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 할인 유형

### 1. 고정 금액 할인 (Fixed)
특정 금액을 할인해주는 방식
```typescript
{
  discount_type: 'fixed',
  discount_value: 5000  // 5,000원 할인
}
```

### 2. 퍼센트 할인 (Percentage)
전체 금액의 일정 비율을 할인하는 방식
```typescript
{
  discount_type: 'percentage',
  discount_value: 10  // 10% 할인
}
```

## 기본 제공 콤보

### 홀 이펙트 + 클릭 버튼 패키지
- **할인**: 5,000원
- **조건**: 홀 이펙트 + 클릭 버튼 동시 신청
- **설명**: 가장 인기 있는 조합

### 백 버튼 + 헤어 트리거 콤보
- **할인**: 3,000원
- **조건**: 백 버튼 + 헤어 트리거 동시 신청
- **설명**: 프로게이머 추천 조합

### 3개 이상 서비스 할인
- **할인**: 10%
- **조건**: 3개 이상의 서비스 선택
- **설명**: 다양한 서비스를 함께 이용하는 고객을 위한 할인

### 프리미엄 패키지
- **할인**: 10,000원
- **조건**: 홀 이펙트 + 클릭 버튼 + 백 버튼 동시 신청
- **설명**: 최고급 업그레이드 패키지

## 할인 적용 규칙

### 중복 할인 방지
- 여러 콤보가 적용 가능한 경우, **가장 큰 할인만 적용**됩니다
- 예: 3개 서비스 선택 시 "10% 할인"과 "프리미엄 패키지" 모두 해당되면, 둘 중 금액이 큰 것만 적용

### 할인 우선순위
1. 할인 금액을 계산
2. 가장 큰 할인 금액을 제공하는 콤보 선택
3. 해당 콤보 1개만 적용

## UI/UX

### 할인 표시
서비스 선택 화면 하단에 할인 정보가 자동으로 표시됩니다:

```
🏷️ 홀 이펙트 + 클릭 버튼 패키지
홀 이펙트와 클릭 버튼을 함께 신청하면 5,000원 할인

서비스 금액    ₩45,000
할인 금액      -₩5,000
─────────────────────
총 예상 금액    ₩40,000
```

### 실시간 계산
- 서비스 선택/해제 시 실시간으로 할인 적용
- 옵션 변경 시에도 자동 재계산
- 최적의 할인 자동 선택

## API 사용법

### 콤보 조회
```typescript
import { useServiceCombos } from '@/hooks/useServiceCombos';

function MyComponent() {
  const { combos, loading, error } = useServiceCombos();

  // combos 배열 사용
}
```

### 수동으로 할인 계산
```typescript
import { fetchServiceCombos } from '@/lib/api';

const combos = await fetchServiceCombos();

// 적용 가능한 콤보 찾기
const applicableCombos = combos.filter(combo => {
  return combo.required_service_ids.every(id =>
    selectedServiceIds.includes(id)
  );
});

// 가장 큰 할인 선택
const bestCombo = applicableCombos.reduce((best, current) => {
  const currentDiscount = calculateDiscount(current, subtotal);
  const bestDiscount = calculateDiscount(best, subtotal);
  return currentDiscount > bestDiscount ? current : best;
}, null);
```

## 새로운 콤보 추가하기

### Supabase Dashboard에서 추가
```sql
INSERT INTO service_combos (
  combo_name,
  description,
  discount_type,
  discount_value,
  required_service_ids,
  is_active
) VALUES (
  '새로운 콤보 이름',
  '할인 설명',
  'fixed',  -- 또는 'percentage'
  5000,
  ARRAY['service-id-1', 'service-id-2'],
  true
);
```

### 마이그레이션 파일로 추가
`supabase/migrations/003_add_new_combo.sql`:
```sql
INSERT INTO service_combos (combo_name, description, discount_type, discount_value, required_service_ids)
VALUES ('새로운 콤보', '설명', 'fixed', 5000, ARRAY['hall-effect', 'battery']);
```

## 주의사항

1. **service_id 확인**: `required_service_ids`는 `services.service_id` (TEXT) 값을 사용합니다
2. **배열 형식**: PostgreSQL 배열 형식을 사용합니다: `ARRAY['id1', 'id2']`
3. **할인 계산**: 최종 가격이 음수가 되지 않도록 주의
4. **활성화 상태**: `is_active = false`인 콤보는 자동으로 제외됩니다

## 테스트 시나리오

### 시나리오 1: 기본 콤보
- 선택: 홀 이펙트 (₩20,000) + 클릭 버튼 (₩25,000)
- 할인: -₩5,000
- 최종: ₩40,000

### 시나리오 2: 3개 서비스 (10% 할인)
- 선택: 홀 이펙트 (₩20,000) + 백 버튼 (₩30,000) + 배터리 (₩25,000)
- 소계: ₩75,000
- 할인: -₩7,500 (10%)
- 최종: ₩67,500

### 시나리오 3: 프리미엄 패키지
- 선택: 홀 이펙트 + 클릭 버튼 + 백 버튼
- 소계: ₩75,000
- 가능한 할인:
  - 홀 이펙트 + 클릭 버튼: -₩5,000
  - 3개 서비스: -₩7,500
  - 프리미엄 패키지: -₩10,000
- 최적 선택: **프리미엄 패키지** -₩10,000
- 최종: ₩65,000

## 문의

할인 시스템 관련 문의나 새로운 콤보 제안은 관리자에게 문의하세요.
