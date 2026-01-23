-- 더미 리뷰 데이터 추가 (100개)
-- 다양한 평점과 승인 상태의 데이터를 포함

-- 1. 승인된 5점 리뷰 (40개)
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('김민수', 5, '스틱 드리프트 완벽하게 고쳐주셨어요! 정말 빠르고 친절한 서비스였습니다. 강력 추천합니다!', true, NOW() - INTERVAL '3 days'),
  ('이지은', 5, 'DualSense Edge 수리 너무 만족스러워요. 새 것처럼 돌아왔네요. 감사합니다!', true, NOW() - INTERVAL '5 days'),
  ('박준호', 5, '진동 모터 교체 후 완벽하게 작동합니다. 가격도 합리적이고 설명도 자세히 해주셔서 좋았어요.', true, NOW() - INTERVAL '7 days'),
  ('정우진', 5, '백 버튼 교체 정말 깔끔하게 해주셨어요. 전문가의 손길이 느껴집니다!', true, NOW() - INTERVAL '12 days'),
  ('임도윤', 5, '전체 점검과 청소 서비스 받았는데 컨트롤러가 새것처럼 깨끗해졌어요!', true, NOW() - INTERVAL '18 days'),
  ('홍민기', 5, '아날로그 스틱 완전 새것처럼 교체해주셨어요. 전문성이 느껴지는 서비스!', true, NOW() - INTERVAL '40 days'),
  ('안수빈', 5, '배터리 교체 후 사용시간이 2배 이상 늘었어요. 정말 만족스럽습니다!', true, NOW() - INTERVAL '45 days'),
  ('권태양', 5, '컨트롤러 수리 전문점답게 완벽하게 처리해주셨습니다. 다음에도 이용하겠습니다!', true, NOW() - INTERVAL '25 days'),
  ('문지혜', 5, '빠른 수리와 친절한 응대 감사합니다. 가격도 합리적이에요!', true, NOW() - INTERVAL '28 days'),
  ('서준영', 5, '터치패드 반응이 정말 좋아졌어요. 완벽한 수리 감사합니다!', true, NOW() - INTERVAL '8 days'),
  ('이하늘', 5, '수리 기간도 짧고 품질도 최고예요. 강력 추천드립니다!', true, NOW() - INTERVAL '15 days'),
  ('최민호', 5, '문제 없이 완벽하게 수리되었습니다. 정말 믿을 수 있는 곳이에요!', true, NOW() - INTERVAL '20 days'),
  ('정서연', 5, '친절한 상담과 빠른 수리로 만족도 200%입니다!', true, NOW() - INTERVAL '30 days'),
  ('김하윤', 5, '스틱 교체 후 게임이 훨씬 즐거워졌어요. 감사합니다!', true, NOW() - INTERVAL '11 days'),
  ('박지훈', 5, '트리거 버튼 수리 완벽해요. 새 컨트롤러 느낌입니다!', true, NOW() - INTERVAL '14 days'),
  ('윤지아', 5, '충전 문제 깔끔하게 해결되었어요. 정말 고맙습니다!', true, NOW() - INTERVAL '17 days'),
  ('강민재', 5, '진동 기능 복구 완벽합니다. 게임 몰입감이 달라졌어요!', true, NOW() - INTERVAL '21 days'),
  ('조수민', 5, '버튼 반응속도가 확실히 개선되었어요. 최고의 서비스!', true, NOW() - INTERVAL '24 days'),
  ('한예준', 5, '꼼꼼한 점검과 수리에 감동받았습니다. 추천해요!', true, NOW() - INTERVAL '27 days'),
  ('신도윤', 5, '가격 대비 퀄리티가 정말 좋아요. 만족스럽습니다!', true, NOW() - INTERVAL '32 days'),
  ('오서준', 5, '빠른 배송과 완벽한 수리! 다시 이용하고 싶어요!', true, NOW() - INTERVAL '35 days'),
  ('유민서', 5, '전문적인 수리와 친절한 응대에 감사드립니다!', true, NOW() - INTERVAL '38 days'),
  ('배현우', 5, '스틱 센서 교체 후 정확도가 확실히 좋아졌어요!', true, NOW() - INTERVAL '42 days'),
  ('송지우', 5, '컨트롤러가 새것처럼 부드러워졌어요. 완벽해요!', true, NOW() - INTERVAL '48 days'),
  ('전예은', 5, 'R2 버튼 수리 정말 깔끔하게 되었어요. 만족합니다!', true, NOW() - INTERVAL '50 days'),
  ('황지호', 5, '충전 속도도 빨라지고 배터리도 오래가요. 최고!', true, NOW() - INTERVAL '55 days'),
  ('노서아', 5, '친절한 설명과 완벽한 수리에 감사드립니다!', true, NOW() - INTERVAL '60 days'),
  ('임태양', 5, '백 버튼 교체 후 게임 실력도 좋아진 것 같아요!', true, NOW() - INTERVAL '65 days'),
  ('차은우', 5, '정말 전문적인 수리였어요. 다음에도 꼭 이용할게요!', true, NOW() - INTERVAL '70 days'),
  ('진수빈', 5, '컨트롤러 수명이 확 늘어난 느낌이에요. 감사합니다!', true, NOW() - INTERVAL '75 days'),
  ('방민석', 5, '스틱 드리프트 완전히 사라졌어요. 정말 고맙습니다!', true, NOW() - INTERVAL '80 days'),
  ('석지안', 5, '수리 품질이 정말 뛰어나요. 추천합니다!', true, NOW() - INTERVAL '85 days'),
  ('남궁하은', 5, '터치패드 감도가 완벽해졌어요. 최고의 서비스!', true, NOW() - INTERVAL '90 days'),
  ('선우도훈', 5, '진동 모터 교체 후 게임이 더 재밌어졌어요!', true, NOW() - INTERVAL '95 days'),
  ('제갈민준', 5, '정말 믿을 수 있는 수리 서비스입니다. 감사해요!', true, NOW() - INTERVAL '100 days'),
  ('황보서윤', 5, '빠른 수리와 합리적인 가격! 완벽합니다!', true, NOW() - INTERVAL '105 days'),
  ('독고준혁', 5, '컨트롤러가 정말 새것같아요. 추천드립니다!', true, NOW() - INTERVAL '110 days'),
  ('사공예진', 5, '친절한 상담과 빠른 처리에 감동했어요!', true, NOW() - INTERVAL '115 days'),
  ('모연우', 5, 'L1 버튼 수리 완벽해요. 정말 감사합니다!', true, NOW() - INTERVAL '120 days'),
  ('탁지율', 5, '가격도 저렴하고 품질도 최고예요. 강추!', true, NOW() - INTERVAL '125 days');

-- 2. 승인된 4점 리뷰 (30개)
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('최서연', 4, '충전 문제 해결되었어요. 조금 시간이 걸렸지만 결과는 만족스럽습니다.', true, NOW() - INTERVAL '10 days'),
  ('강하늘', 4, 'R2 버튼 수리 잘 되었습니다. 가격이 조금 비싼 것 같긴 하지만 품질은 좋아요.', true, NOW() - INTERVAL '14 days'),
  ('윤서아', 4, '홀 이펙트 센서 교체 후 스틱이 훨씬 부드러워졌어요. 만족합니다.', true, NOW() - INTERVAL '16 days'),
  ('조예린', 4, '전원 버튼 수리 잘 마무리되었습니다. 친절하게 설명해주셔서 감사해요.', true, NOW() - INTERVAL '35 days'),
  ('신유진', 4, '연결 문제 해결되었습니다. 설명도 자세히 해주시고 좋았어요.', true, NOW() - INTERVAL '22 days'),
  ('김도현', 4, '수리 품질은 좋은데 대기시간이 조금 길었어요.', true, NOW() - INTERVAL '19 days'),
  ('이소율', 4, '전반적으로 만족스럽습니다. 가격이 조금만 더 저렴하면 좋겠어요.', true, NOW() - INTERVAL '26 days'),
  ('박시우', 4, '스틱 교체 잘 되었어요. 약간의 이물감이 있지만 괜찮습니다.', true, NOW() - INTERVAL '31 days'),
  ('정다은', 4, '친절한 서비스와 깔끔한 수리! 만족합니다.', true, NOW() - INTERVAL '36 days'),
  ('한재민', 4, '버튼 반응이 좋아졌어요. 조금 더 빨랐으면 더 좋았을 것 같아요.', true, NOW() - INTERVAL '41 days'),
  ('강서진', 4, '수리 결과는 만족스러워요. 포장이 조금 더 꼼꼼했으면 좋겠네요.', true, NOW() - INTERVAL '46 days'),
  ('윤하준', 4, '충전 문제 해결! 배송이 조금 느렸지만 수리는 만족해요.', true, NOW() - INTERVAL '51 days'),
  ('조아인', 4, '진동 기능 복구되었어요. 전반적으로 좋습니다.', true, NOW() - INTERVAL '56 days'),
  ('최유빈', 4, '터치패드 수리 잘 되었습니다. 가격이 적당해요.', true, NOW() - INTERVAL '61 days'),
  ('김서준', 4, '트리거 버튼 교체 만족스러워요. 다만 시간이 좀 걸렸네요.', true, NOW() - INTERVAL '66 days'),
  ('이예나', 4, '스틱 센서 교체 후 훨씬 좋아졌어요. 추천합니다.', true, NOW() - INTERVAL '71 days'),
  ('박민재', 4, '수리 품질 좋아요. 배송 속도만 개선되면 완벽할 것 같아요.', true, NOW() - INTERVAL '76 days'),
  ('정하윤', 4, '백 버튼 수리 잘 되었습니다. 만족스러워요.', true, NOW() - INTERVAL '81 days'),
  ('한지후', 4, '컨트롤러가 확실히 좋아졌어요. 가격이 조금 부담되긴 해요.', true, NOW() - INTERVAL '86 days'),
  ('강시아', 4, '전체적으로 만족합니다. 다음에도 이용할 의향 있어요.', true, NOW() - INTERVAL '91 days'),
  ('윤도윤', 4, 'R1 버튼 수리 괜찮아요. 조금만 더 빨랐으면 좋았을 거예요.', true, NOW() - INTERVAL '96 days'),
  ('조서윤', 4, '충전 속도가 개선되었어요. 만족스럽습니다.', true, NOW() - INTERVAL '101 days'),
  ('최우진', 4, '진동 모터 교체 잘 되었어요. 가격이 합리적이에요.', true, NOW() - INTERVAL '106 days'),
  ('김지안', 4, '스틱 드리프트 많이 나아졌어요. 좋습니다.', true, NOW() - INTERVAL '111 days'),
  ('이다율', 4, '수리 결과 만족해요. 상담이 친절했습니다.', true, NOW() - INTERVAL '116 days'),
  ('박서현', 4, '터치패드 반응 좋아졌어요. 전반적으로 괜찮습니다.', true, NOW() - INTERVAL '121 days'),
  ('정민규', 4, 'L2 버튼 수리 완료! 만족스러운 결과예요.', true, NOW() - INTERVAL '126 days'),
  ('한예림', 4, '컨트롤러 상태 많이 좋아졌어요. 추천합니다.', true, NOW() - INTERVAL '130 days'),
  ('강태현', 4, '수리 품질 좋고 가격도 적당해요.', true, NOW() - INTERVAL '135 days'),
  ('윤채원', 4, '전체 점검 후 확실히 달라졌어요. 만족합니다.', true, NOW() - INTERVAL '140 days');

-- 3. 승인된 3점 리뷰 (15개)
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('배준서', 3, '수리는 잘 되었는데 생각보다 시간이 오래 걸렸어요. 하지만 결과는 괜찮습니다.', true, NOW() - INTERVAL '20 days'),
  ('송민호', 3, '기대했던 것보다는 조금 아쉬워요. 그래도 작동은 잘 됩니다.', true, NOW() - INTERVAL '33 days'),
  ('류지원', 3, '수리는 됐는데 완벽하진 않아요. 보통 수준입니다.', true, NOW() - INTERVAL '43 days'),
  ('문태일', 3, '가격 대비 괜찮은 것 같아요. 기대치를 낮추면 만족할 만해요.', true, NOW() - INTERVAL '53 days'),
  ('장수아', 3, '스틱 교체 후 약간 이물감이 있어요. 쓸만은 합니다.', true, NOW() - INTERVAL '63 days'),
  ('허예준', 3, '배송이 너무 오래 걸렸어요. 수리 자체는 괜찮습니다.', true, NOW() - INTERVAL '73 days'),
  ('곽민지', 3, '기대했던 것과는 조금 달라요. 그래도 쓸만해요.', true, NOW() - INTERVAL '83 days'),
  ('남서영', 3, '가격이 생각보다 비싸네요. 수리는 됐습니다.', true, NOW() - INTERVAL '93 days'),
  ('안준혁', 3, '평범한 수리 서비스예요. 특별히 좋지도 나쁘지도 않아요.', true, NOW() - INTERVAL '103 days'),
  ('표지호', 3, '대기 시간이 길었어요. 수리 품질은 보통입니다.', true, NOW() - INTERVAL '113 days'),
  ('노아영', 3, '기대만큼은 아니지만 쓸만해요.', true, NOW() - INTERVAL '123 days'),
  ('도서후', 3, '수리는 됐는데 완벽하진 않네요.', true, NOW() - INTERVAL '128 days'),
  ('변현서', 3, '가격이 조금 부담스러워요. 품질은 보통입니다.', true, NOW() - INTERVAL '133 days'),
  ('설지우', 3, '배송 지연이 아쉬웠어요. 수리 자체는 괜찮습니다.', true, NOW() - INTERVAL '138 days'),
  ('편민서', 3, '보통 수준의 수리 서비스예요.', true, NOW() - INTERVAL '143 days');

-- 4. 승인 대기 중인 5점 리뷰 (10개)
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('한지우', 5, '좌측 스틱 교체 완벽합니다! 이제 게임 제대로 즐길 수 있어요. 정말 감사합니다!', false, NOW() - INTERVAL '6 hours'),
  ('오하은', 5, '트리거 효과 센서 교체 후 게임 경험이 완전히 달라졌어요. 최고입니다!', false, NOW() - INTERVAL '2 days'),
  ('서우주', 5, '정말 빠르고 정확한 수리였어요. 대만족입니다!', false, NOW() - INTERVAL '1 day'),
  ('홍라온', 5, '컨트롤러가 새것처럼 좋아졌어요. 강추합니다!', false, NOW() - INTERVAL '3 days'),
  ('구하람', 5, '전문적인 수리에 감동받았어요. 완벽해요!', false, NOW() - INTERVAL '4 days'),
  ('길채아', 5, '수리 품질 최고! 다음에도 꼭 이용할게요!', false, NOW() - INTERVAL '5 days'),
  ('빈시율', 5, '친절한 상담과 빠른 수리 정말 좋았어요!', false, NOW() - INTERVAL '6 days'),
  ('나예서', 5, '컨트롤러 수명이 확실히 늘어난 것 같아요. 감사합니다!', false, NOW() - INTERVAL '12 hours'),
  ('금나윤', 5, '가격 대비 품질이 정말 좋아요. 추천드립니다!', false, NOW() - INTERVAL '18 hours'),
  ('피아라', 5, '완벽한 수리 서비스! 정말 만족스러워요!', false, NOW() - INTERVAL '1 day');

-- 5. 승인 대기 중인 4점 리뷰 (5개)
INSERT INTO reviews (customer_name, rating, comment, is_approved, created_at)
VALUES
  ('송민재', 4, 'L1/R1 버튼 수리 잘 되었어요. 다만 조금 더 빨랐으면 좋았을 것 같아요.', false, NOW() - INTERVAL '1 day'),
  ('태서준', 4, '수리 품질은 좋은데 가격이 조금 아쉬워요.', false, NOW() - INTERVAL '2 days'),
  ('사하율', 4, '전반적으로 만족합니다. 배송만 빨랐으면 완벽했을 거예요.', false, NOW() - INTERVAL '3 days'),
  ('명지후', 4, '스틱 교체 잘 되었어요. 만족스럽습니다.', false, NOW() - INTERVAL '4 days'),
  ('옹서아', 4, '친절한 서비스와 좋은 품질! 추천해요.', false, NOW() - INTERVAL '5 days');
