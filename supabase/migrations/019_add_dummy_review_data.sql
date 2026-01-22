-- 더미 리뷰 데이터 추가
-- 다양한 평점과 승인 상태의 데이터를 포함

-- 1. 승인된 리뷰 (높은 평점)
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('김민수', 5, '스틱 드리프트 완벽하게 고쳐주셨어요! 정말 빠르고 친절한 서비스였습니다. 강력 추천합니다!', true, NOW() - INTERVAL '3 days'),
  ('이지은', 5, 'DualSense Edge 수리 너무 만족스러워요. 새 것처럼 돌아왔네요. 감사합니다!', true, NOW() - INTERVAL '5 days'),
  ('박준호', 5, '진동 모터 교체 후 완벽하게 작동합니다. 가격도 합리적이고 설명도 자세히 해주셔서 좋았어요.', true, NOW() - INTERVAL '7 days'),
  ('최서연', 4, '충전 문제 해결되었어요. 조금 시간이 걸렸지만 결과는 만족스럽습니다.', true, NOW() - INTERVAL '10 days'),
  ('정우진', 5, '백 버튼 교체 정말 깔끔하게 해주셨어요. 전문가의 손길이 느껴집니다!', true, NOW() - INTERVAL '12 days');

-- 2. 승인된 리뷰 (중간 평점)
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('강하늘', 4, 'R2 버튼 수리 잘 되었습니다. 가격이 조금 비싼 것 같긴 하지만 품질은 좋아요.', true, NOW() - INTERVAL '14 days'),
  ('윤서아', 4, '홀 이펙트 센서 교체 후 스틱이 훨씬 부드러워졌어요. 만족합니다.', true, NOW() - INTERVAL '16 days'),
  ('임도윤', 5, '전체 점검과 청소 서비스 받았는데 컨트롤러가 새것처럼 깨끗해졌어요!', true, NOW() - INTERVAL '18 days');

-- 3. 승인 대기 중인 리뷰 (최근)
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('한지우', 5, '좌측 스틱 교체 완벽합니다! 이제 게임 제대로 즐길 수 있어요. 정말 감사합니다!', false, NOW() - INTERVAL '6 hours'),
  ('송민재', 4, 'L1/R1 버튼 수리 잘 되었어요. 다만 조금 더 빨랐으면 좋았을 것 같아요.', false, NOW() - INTERVAL '1 day'),
  ('오하은', 5, '트리거 효과 센서 교체 후 게임 경험이 완전히 달라졌어요. 최고입니다!', false, NOW() - INTERVAL '2 days');

-- 4. 승인된 리뷰 (지난 달)
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('조예린', 4, '전원 버튼 수리 잘 마무리되었습니다. 친절하게 설명해주셔서 감사해요.', true, NOW() - INTERVAL '35 days'),
  ('홍민기', 5, '아날로그 스틱 완전 새것처럼 교체해주셨어요. 전문성이 느껴지는 서비스!', true, NOW() - INTERVAL '40 days'),
  ('안수빈', 5, '배터리 교체 후 사용시간이 2배 이상 늘었어요. 정말 만족스럽습니다!', true, NOW() - INTERVAL '45 days');

-- 5. 추가 다양한 평점의 승인된 리뷰
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('배준서', 3, '수리는 잘 되었는데 생각보다 시간이 오래 걸렸어요. 하지만 결과는 괜찮습니다.', true, NOW() - INTERVAL '20 days'),
  ('신유진', 4, '연결 문제 해결되었습니다. 설명도 자세히 해주시고 좋았어요.', true, NOW() - INTERVAL '22 days'),
  ('권태양', 5, '컨트롤러 수리 전문점답게 완벽하게 처리해주셨습니다. 다음에도 이용하겠습니다!', true, NOW() - INTERVAL '25 days'),
  ('문지혜', 5, '빠른 수리와 친절한 응대 감사합니다. 가격도 합리적이에요!', true, NOW() - INTERVAL '28 days');
