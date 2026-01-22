-- ============================================
-- 리뷰 더미 데이터 SQL 쿼리
-- ============================================
--
-- 사용 방법:
-- 1. 먼저 수리 의뢰 더미 데이터가 생성되어 있어야 합니다.
-- 2. 이 쿼리를 Supabase SQL Editor에서 실행하세요.
--
-- 참고: repair_request_id는 실제 repair_requests 테이블에 존재하는 ID를 사용해야 합니다.
-- 아래 쿼리에서는 예시로 UUID를 사용하므로, 실제 데이터베이스의 ID로 교체하거나
-- 먼저 수리 의뢰 더미 데이터를 생성한 후 이 쿼리를 수정하여 실행하세요.

-- ============================================
-- Step 1: 기존 수리 의뢰 확인 (선택사항)
-- ============================================
-- 먼저 수리 의뢰 데이터가 있는지 확인합니다.
-- SELECT id, customer_name, status, created_at FROM repair_requests ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- Step 2: 리뷰 더미 데이터 삽입
-- ============================================
--
-- 주의: 아래의 repair_request_id는 예시 UUID입니다.
-- 실제로는 repair_requests 테이블에 있는 유효한 ID를 사용하거나,
-- 먼저 수리 의뢰 더미 데이터를 생성하세요.
--
-- repair_request_id가 없는 리뷰도 생성 가능합니다 (NULL로 설정).

-- 리뷰 더미 데이터 (총 15개)
INSERT INTO reviews (
  id,
  repair_request_id,
  customer_name,
  rating,
  content,
  service_name,
  image_url,
  is_approved,
  is_public
) VALUES
-- 승인되고 공개된 리뷰 (5개)
(
  gen_random_uuid(),
  NULL, -- 직접 작성한 리뷰 (수리 의뢰 없음)
  '김*수',
  5,
  '홀 이펙트 센서 업그레이드를 받고 나서 스틱 드리프트가 완전히 사라졌어요! 정말 감사합니다. 작업도 빠르고 결과도 완벽합니다.',
  '홀 이펙트 센서 업그레이드',
  'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwY29udHJvbGxlciUyMHN0aWNrfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=600',
  true,
  true
),
(
  gen_random_uuid(),
  NULL,
  '이*진',
  5,
  '클릭키 버튼 모듈이 게임 경험을 완전히 바꿨습니다. 버튼 반응성이 정말 좋아요. 추천합니다!',
  '클릭키 버튼 모듈',
  NULL,
  true,
  true
),
(
  gen_random_uuid(),
  NULL,
  '박*현',
  4,
  '백버튼 모드가 프로게이머처럼 플레이할 수 있게 해줘요. 매핑 설정도 쉬웠고 반응도 좋습니다.',
  '백버튼 모드',
  NULL,
  true,
  true
),
(
  gen_random_uuid(),
  NULL,
  '최*민',
  5,
  '고용량 배터리 덕분에 이제 충전 걱정 없이 게임할 수 있어요. 배터리 수명이 정말 길어졌습니다!',
  '고용량 배터리',
  'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXR0ZXJ5JTIwY2hhcmdpbmd8ZW58MXx8fHwxNzY4OTI3MTk0fDA&ixlib=rb-4.1.0&q=80&w=600',
  true,
  true
),
(
  gen_random_uuid(),
  NULL,
  '정*우',
  5,
  '헤어 트리거 덕분에 FPS 게임에서 훨씬 우위를 점할 수 있어요. 반응 속도가 정말 좋습니다!',
  '헤어 트리거',
  NULL,
  true,
  true
),

-- 승인되었지만 비공개인 리뷰 (3개)
(
  gen_random_uuid(),
  NULL,
  '한*호',
  5,
  '커스텀 쉘 색상이 너무 예뻐요! 내 컨트롤러가 완전 다른 느낌이에요.',
  '커스텀 쉘 교체',
  'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBnYW1pbmclMjBjb250cm9sbGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=600',
  true,
  false
),
(
  gen_random_uuid(),
  NULL,
  '양*서',
  4,
  '굴리킷 TMR 센서를 선택했는데 텐션 조절 기능이 정말 유용해요. 튜닝이 쉬워서 좋습니다.',
  '홀 이펙트 센서 업그레이드',
  NULL,
  true,
  false
),
(
  gen_random_uuid(),
  NULL,
  '오*승',
  5,
  'RISE4 백버튼이 편해요! 4개 버튼으로 복잡한 입력도 쉽게 할 수 있어서 좋습니다.',
  '백버튼 모드',
  NULL,
  true,
  false
),

-- 승인 대기 중인 리뷰 (5개)
(
  gen_random_uuid(),
  NULL,
  '강*민',
  5,
  '수리가 너무 빨라서 놀랐습니다. 하루 만에 완성해서 보내주셨어요!',
  '홀 이펙트 센서 업그레이드',
  NULL,
  false,
  false
),
(
  gen_random_uuid(),
  NULL,
  '조*원',
  4,
  '서비스가 전반적으로 만족스럽습니다. 다만 배송이 조금 늦었어요.',
  '클릭키 버튼 모듈',
  NULL,
  false,
  false
),
(
  gen_random_uuid(),
  NULL,
  '진*영',
  5,
  '작업 퀄리티가 정말 좋습니다. 만족합니다!',
  '고용량 배터리',
  NULL,
  false,
  false
),
(
  gen_random_uuid(),
  NULL,
  '윤*수',
  5,
  '프로 같은 솜씨네요! 완벽합니다.',
  '커스텀 쉘 교체',
  'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm8lMjBnYW1pbmclMjBjb250cm9sbGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=600',
  false,
  false
),
(
  gen_random_uuid(),
  NULL,
  '신*호',
  4,
  '헤어 트리거가 FPS 게임에서 정말 큰 도움이 됩니다. 추천합니다!',
  '헤어 트리거',
  NULL,
  false,
  false
);

-- 실제 수리 의뢰와 연결된 리뷰 예시 (repair_request_id를 실제 ID로 교체 필요)
-- 아래는 예시이며, 실제 사용 시에는 repair_requests 테이블의 실제 ID를 사용하세요.
-- (
--   'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', -- 실제 repair_request_id로 교체 필요
--   '김*철',
--   5,
--   '수리 완벽하게 됐어요! 홀 이펙트랑 클릭키 같이 받았는데 너무 좋아요.',
--   '홀 이펙트 센서 업그레이드',
--   NULL,
--   true,
--   true
-- ),
-- (
--   'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', -- 실제 repair_request_id로 교체 필요
--   '이*미',
--   4,
--   '백버튼이 좋아서 추가했어요. 이제 더 잘할 수 있겠네요!',
--   '백버튼 모드',
--   NULL,
--   false,
--   false
-- );

-- ============================================
-- Step 3: 결과 확인
-- ============================================
-- 생성된 리뷰 확인
-- SELECT
--   id,
--   customer_name,
--   rating,
--   content,
--   service_name,
--   is_approved,
--   is_public,
--   created_at
-- FROM reviews
-- ORDER BY created_at DESC;

-- 승인 상태별 통계
-- SELECT
--   is_approved,
--   is_public,
--   COUNT(*) as count
-- FROM reviews
-- GROUP BY is_approved, is_public;

-- 평점별 통계
-- SELECT
--   rating,
--   COUNT(*) as count
-- FROM reviews
-- GROUP BY rating
-- ORDER BY rating DESC;

-- 서비스별 리뷰 수
-- SELECT
--   service_name,
--   COUNT(*) as review_count,
--   ROUND(AVG(rating), 1) as average_rating
-- FROM reviews
-- GROUP BY service_name
-- ORDER BY review_count DESC;
