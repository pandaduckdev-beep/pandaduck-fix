UPDATE controller_services
SET
  summary = CASE service_id
    WHEN 'refresh' THEN '스틱 쏠림과 오입력을 안정적으로 줄이는 수리'
    WHEN 'hammer' THEN '스틱 쏠림과 오입력을 안정적으로 줄이는 수리'
    WHEN 'sensor' THEN '스틱 쏠림과 오입력을 안정적으로 줄이는 수리'
    WHEN 'dff' THEN '버튼 반응성과 입력 정확도를 높여주는 커스텀'
    WHEN 'circuit' THEN '버튼 반응성과 입력 정확도를 높여주는 커스텀'
    WHEN 'back-buttons' THEN '엄지를 떼지 않고 조작할 수 있게 백버튼을 추가하는 커스텀'
    WHEN 'paint' THEN '취향에 맞는 외형으로 컨트롤러를 커스텀하는 작업'
    WHEN 'activity' THEN '트리거 입력 거리를 조정해 반응성을 높이는 커스텀'
    WHEN 'battery' THEN '고용량 배터리로 플레이 시간을 늘리는 교체 작업'
    ELSE summary
  END,
  detail_tags = CASE service_id
    WHEN 'refresh' THEN '["드리프트 개선","정밀 입력","캘리브레이션"]'::jsonb
    WHEN 'hammer' THEN '["드리프트 개선","정밀 입력","캘리브레이션"]'::jsonb
    WHEN 'sensor' THEN '["드리프트 개선","정밀 입력","캘리브레이션"]'::jsonb
    WHEN 'dff' THEN '["클릭감 강화","반응 속도","입력 안정성"]'::jsonb
    WHEN 'circuit' THEN '["클릭감 강화","반응 속도","입력 안정성"]'::jsonb
    WHEN 'back-buttons' THEN '["백버튼 추가","리맵 지원","경쟁 게임 최적화"]'::jsonb
    WHEN 'paint' THEN '["커스텀 디자인","쉘 교체","외형 튜닝"]'::jsonb
    WHEN 'activity' THEN '["트리거 튜닝","입력 반응","FPS 최적화"]'::jsonb
    WHEN 'battery' THEN '["배터리 교체","플레이타임 증가","전원 안정화"]'::jsonb
    ELSE detail_tags
  END,
  expected_results = CASE service_id
    WHEN 'refresh' THEN '["미세 조작 안정감 향상","스틱 중심 복귀감 개선","장시간 플레이 시 입력 편차 감소"]'::jsonb
    WHEN 'hammer' THEN '["미세 조작 안정감 향상","스틱 중심 복귀감 개선","장시간 플레이 시 입력 편차 감소"]'::jsonb
    WHEN 'sensor' THEN '["미세 조작 안정감 향상","스틱 중심 복귀감 개선","장시간 플레이 시 입력 편차 감소"]'::jsonb
    WHEN 'dff' THEN '["버튼 입력 누락 체감 감소","연타 시 반응 일관성 향상","조작 피드백 선명도 개선"]'::jsonb
    WHEN 'circuit' THEN '["버튼 입력 누락 체감 감소","연타 시 반응 일관성 향상","조작 피드백 선명도 개선"]'::jsonb
    WHEN 'back-buttons' THEN '["조작 동선 단축","전투 중 입력 속도 향상","복합 입력 편의성 개선"]'::jsonb
    WHEN 'paint' THEN '["그립감/외형 만족도 향상","개인 취향 반영","사용 몰입감 개선"]'::jsonb
    WHEN 'activity' THEN '["트리거 입력 반응 속도 향상","사격 타이밍 안정화","손 피로도 완화"]'::jsonb
    WHEN 'battery' THEN '["충전 주기 감소","장시간 플레이 안정성 향상","전원 불안정 체감 감소"]'::jsonb
    ELSE expected_results
  END
WHERE is_active = true;

UPDATE controller_service_options
SET target_audience = CASE
  WHEN option_name ~ '720' THEN '세밀한 텐션 조절과 정밀 조작을 원하는 사용자'
  WHEN option_name ~* 'TMR' THEN '드리프트 재발을 줄이고 정확도를 높이고 싶은 사용자'
  WHEN option_name LIKE '%기본%' THEN '기본 수리를 우선하면서 안정성을 챙기고 싶은 사용자'
  WHEN option_name ~* 'V4|4버튼' THEN '복합 입력이 많은 경쟁 게임 사용자'
  WHEN option_name ~* 'V3|2버튼' THEN '백버튼 커스텀을 입문 단계로 시작하는 사용자'
  WHEN option_name LIKE '%양쪽%' THEN '양쪽 스틱/부품을 동시에 점검하고 싶은 사용자'
  ELSE '현재 증상 개선을 우선하는 사용자'
END;
