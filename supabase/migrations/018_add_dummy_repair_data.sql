-- 더미 수리 신청 데이터 추가
-- 다양한 상태와 시간대의 데이터를 포함
-- 연락처는 모두 010-9559-7583으로 통일 (카카오톡 연동 테스트 시 실제 발송 방지)

-- 1. 대기중 상태 (최근)
INSERT INTO repair_requests (customer_name, customer_phone, customer_email, controller_model, issue_description, status, total_amount, created_at)
VALUES
  ('김민수', '010-9559-7583', 'minsu@example.com', 'DualSense', '좌측 스틱 드리프트 현상', 'pending', 35000, NOW() - INTERVAL '2 hours'),
  ('이지은', '010-9559-7583', 'jieun@example.com', 'DualSense Edge', '우측 트리거 버튼 반응 없음', 'pending', 45000, NOW() - INTERVAL '5 hours');

-- 2. 확인됨 상태
INSERT INTO repair_requests (customer_name, customer_phone, customer_email, controller_model, issue_description, status, total_amount, created_at)
VALUES
  ('박준호', '010-9559-7583', 'junho@example.com', 'DualSense', '진동 모터 고장', 'confirmed', 40000, NOW() - INTERVAL '1 day'),
  ('최서연', '010-9559-7583', 'seoyeon@example.com', 'DualSense', '충전 불가', 'confirmed', 30000, NOW() - INTERVAL '1 day 3 hours');

-- 3. 진행중 상태
INSERT INTO repair_requests (customer_name, customer_phone, customer_email, controller_model, issue_description, status, total_amount, created_at)
VALUES
  ('정우진', '010-9559-7583', 'woojin@example.com', 'DualSense Edge', '백 버튼 교체', 'in_progress', 50000, NOW() - INTERVAL '2 days'),
  ('강하늘', '010-9559-7583', 'haneul@example.com', 'DualSense', 'R2 버튼 스프링 교체', 'in_progress', 35000, NOW() - INTERVAL '2 days 5 hours');

-- 4. 완료 상태 (이번 달)
INSERT INTO repair_requests (customer_name, customer_phone, customer_email, controller_model, issue_description, status, total_amount, created_at)
VALUES
  ('윤서아', '010-9559-7583', 'seoa@example.com', 'DualSense', '홀 이펙트 센서 교체', 'completed', 45000, NOW() - INTERVAL '3 days'),
  ('임도윤', '010-9559-7583', 'doyun@example.com', 'DualSense Edge', '전체 점검 및 청소', 'completed', 55000, NOW() - INTERVAL '5 days'),
  ('한지우', '010-9559-7583', 'jiwoo@example.com', 'DualSense', '좌측 스틱 교체', 'completed', 38000, NOW() - INTERVAL '7 days'),
  ('송민재', '010-9559-7583', 'minjae@example.com', 'DualSense', 'L1/R1 버튼 수리', 'completed', 32000, NOW() - INTERVAL '10 days'),
  ('오하은', '010-9559-7583', 'haeun@example.com', 'DualSense Edge', '트리거 효과 센서 교체', 'completed', 48000, NOW() - INTERVAL '12 days');

-- 5. 취소 상태
INSERT INTO repair_requests (customer_name, customer_phone, customer_email, controller_model, issue_description, status, total_amount, created_at)
VALUES
  ('배준서', '010-9559-7583', 'junseo@example.com', 'DualSense', '터치패드 불량', 'cancelled', 35000, NOW() - INTERVAL '4 days'),
  ('신유진', '010-9559-7583', 'yujin@example.com', 'DualSense', '연결 불량', 'cancelled', 28000, NOW() - INTERVAL '8 days');

-- 6. 지난 달 완료 데이터 (매출 비교용)
INSERT INTO repair_requests (customer_name, customer_phone, customer_email, controller_model, issue_description, status, total_amount, created_at)
VALUES
  ('조예린', '010-9559-7583', 'yerin@example.com', 'DualSense', '전원 버튼 수리', 'completed', 30000, NOW() - INTERVAL '35 days'),
  ('홍민기', '010-9559-7583', 'minki@example.com', 'DualSense Edge', '아날로그 스틱 교체', 'completed', 52000, NOW() - INTERVAL '40 days'),
  ('안수빈', '010-9559-7583', 'subin@example.com', 'DualSense', '배터리 교체', 'completed', 42000, NOW() - INTERVAL '45 days');
