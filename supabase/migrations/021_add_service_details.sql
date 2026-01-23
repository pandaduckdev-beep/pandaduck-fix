-- Add detailed information fields to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS detailed_description TEXT,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb, -- Array of feature strings
ADD COLUMN IF NOT EXISTS process_steps JSONB DEFAULT '[]'::jsonb, -- Array of process step strings
ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT '1일',
ADD COLUMN IF NOT EXISTS warranty TEXT DEFAULT '1년',
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing services with default values
UPDATE services
SET
  subtitle = CASE service_id
    WHEN 'hall-effect' THEN '스틱 드리프트 영구 해결'
    WHEN 'clicky-buttons' THEN 'eXtremeRate 프리미엄 스위치'
    WHEN 'back-buttons' THEN '프로급 후면 패들 장착'
    WHEN 'battery' THEN '최대 3배 더 긴 플레이타임'
    WHEN 'hair-trigger' THEN '경쟁 게임 최적화'
    WHEN 'custom-shell' THEN '완전 커스텀 외관'
    ELSE '프리미엄 서비스'
  END,
  detailed_description = CASE service_id
    WHEN 'hall-effect' THEN 'PS5 컨트롤러의 가장 흔한 문제인 스틱 드리프트를 영구적으로 해결합니다. 기존 전통적인 포텐셔미터 방식 대신, 자석 기반의 홀 이펙트 센서를 사용하여 물리적 마모가 없어 드리프트 현상이 발생하지 않습니다. ALPS, Gulikit, TMR 등 다양한 등급의 센서 옵션을 제공합니다.'
    WHEN 'clicky-buttons' THEN 'eXtremeRate의 프리미엄 촉감 스위치를 장착하여 버튼의 반응성과 내구성을 극대화합니다. 기계식 키보드와 같은 명확한 클릭감으로 입력의 정확성이 향상되며, 특히 격투 게임이나 리듬 게임에서 뛰어난 성능을 발휘합니다.'
    WHEN 'back-buttons' THEN '컨트롤러 뒷면에 2~4개의 프로그래밍 가능한 패들 버튼을 추가하여 경쟁력을 높입니다. 엄지를 스틱에서 떼지 않고도 추가 기능을 실행할 수 있어, FPS와 배틀로얄 장르에서 특히 유용합니다. 프로게이머들이 가장 선호하는 커스터마이징입니다.'
    WHEN 'battery' THEN '순정 배터리(1560mAh)를 고용량 3000mAh 또는 4000mAh 배터리로 교체하여 충전 없이 더 오래 게임을 즐길 수 있습니다. 안전 인증을 받은 프리미엄 배터리만 사용하며, 과충전/과방전 보호 회로가 내장되어 있습니다.'
    WHEN 'hair-trigger' THEN '트리거의 이동 거리를 조절하여 빠른 연사가 필요한 게임에서 유리합니다. 물리적 스톱퍼를 장착하거나 디지털 방식으로 조절 가능하며, FPS 게임에서 빠른 반응속도를 제공합니다.'
    WHEN 'custom-shell' THEN '다양한 색상과 디자인의 프리미엄 쉘로 교체하여 나만의 개성을 표현하세요. 투명, 메탈릭, LED 백라이트 등 다양한 옵션이 있으며, 내구성이 뛰어난 고품질 소재만 사용합니다.'
    ELSE description
  END,
  features = CASE service_id
    WHEN 'hall-effect' THEN '["영구적인 드리프트 방지 - 자석 센서로 물리적 마모 없음","정밀한 조작감 - 원래보다 더 정확한 입력","다양한 센서 옵션 - ALPS부터 TMR까지","빠른 작업 완료 - 1일 내 작업 완료","평생 보증 - 드리프트 재발 시 무상 재작업"]'::jsonb
    WHEN 'clicky-buttons' THEN '["명확한 클릭감 - 기계식 스위치 같은 촉감","빠른 반응속도 - 0.1ms 입력 지연 감소","향상된 내구성 - 500만회 이상 클릭 보장","정확한 입력 - 우발적 입력 방지","프로게이머 선호 - 격투게임 필수 모드"]'::jsonb
    WHEN 'back-buttons' THEN '["2~4개의 프로그래밍 가능한 패들 버튼","커스텀 버튼 매핑 - 원하는 기능 자유 설정","에르고노믹 디자인 - 손에 편안한 위치","프로게이머 필수템 - 경쟁 게임 우위","빌드 인 방식 - 외부 부착이 아닌 내장형"]'::jsonb
    WHEN 'battery' THEN '["3배 긴 플레이타임 - 최대 30시간 사용","안전 인증 배터리 - KC, CE 인증 완료","과충전 보호 회로 내장","순정과 동일한 크기 - 쉘 가공 불필요","빠른 충전 지원 - USB-C 고속 충전"]'::jsonb
    WHEN 'hair-trigger' THEN '["조절 가능한 트리거 거리 - 3단계 설정","빠른 연사 속도 - 반응 시간 50% 단축","물리적 + 디지털 조절 옵션","FPS 게임 필수 - 경쟁 우위 확보","순정 복구 가능 - 언제든 원상 복구"]'::jsonb
    WHEN 'custom-shell' THEN '["100가지 이상의 색상/디자인 옵션","프리미엄 소재 - ABS, PC, 메탈 옵션","LED 백라이트 옵션 - RGB 커스터마이징","정밀 가공 - 순정과 동일한 조립감","내구성 보장 - 일상 사용 1년 보증"]'::jsonb
    ELSE '[]'::jsonb
  END,
  process_steps = CASE service_id
    WHEN 'hall-effect' THEN '["컨트롤러 정밀 분해 및 상태 점검","기존 아날로그 스틱 모듈 제거","홀 이펙트 센서 모듈 장착 및 캘리브레이션","품질 테스트 및 최종 점검","조립 완료 및 동작 확인"]'::jsonb
    WHEN 'clicky-buttons' THEN '["컨트롤러 분해 및 버튼 모듈 접근","기존 러버돔 방식 버튼 제거","eXtremeRate 클릭키 모듈 정밀 장착","버튼 반응성 테스트 및 조정","최종 조립 및 품질 확인"]'::jsonb
    WHEN 'back-buttons' THEN '["컨트롤러 완전 분해","백버튼 모듈 장착을 위한 쉘 가공","회로 연결 및 패들 버튼 장착","버튼 매핑 프로그래밍","작동 테스트 및 최종 조립"]'::jsonb
    WHEN 'battery' THEN '["컨트롤러 분해 및 기존 배터리 제거","배터리 커넥터 점검 및 청소","고용량 배터리 장착 및 연결","충전 테스트 및 전압 확인","최종 조립 및 용량 확인"]'::jsonb
    WHEN 'hair-trigger' THEN '["컨트롤러 분해 및 트리거 모듈 접근","기존 트리거 메커니즘 분석","스톱퍼 장착 또는 디지털 조절 장치 설치","트리거 거리 세밀 조정","게임 테스트 및 최종 확인"]'::jsonb
    WHEN 'custom-shell' THEN '["컨트롤러 완전 분해 및 부품 분류","내부 부품 청소 및 점검","커스텀 쉘 조립 및 피팅 확인","LED 설치 (선택 시)","최종 조립 및 품질 검수"]'::jsonb
    ELSE '[]'::jsonb
  END,
  duration = CASE service_id
    WHEN 'hall-effect' THEN '1일'
    WHEN 'clicky-buttons' THEN '1일'
    WHEN 'back-buttons' THEN '2일'
    WHEN 'battery' THEN '1일'
    WHEN 'hair-trigger' THEN '1일'
    WHEN 'custom-shell' THEN '2-3일'
    ELSE '1일'
  END,
  warranty = CASE service_id
    WHEN 'hall-effect' THEN '평생'
    WHEN 'clicky-buttons' THEN '1년'
    WHEN 'back-buttons' THEN '1년'
    WHEN 'battery' THEN '6개월'
    WHEN 'hair-trigger' THEN '1년'
    WHEN 'custom-shell' THEN '1년'
    ELSE '1년'
  END,
  image_url = CASE service_id
    WHEN 'hall-effect' THEN 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwY29udHJvbGxlciUyMHN0aWNrfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080'
    WHEN 'clicky-buttons' THEN 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBidXR0b25zfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080'
    WHEN 'back-buttons' THEN 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm8lMjBnYW1pbmclMjBjb250cm9sbGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080'
    WHEN 'battery' THEN 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXR0ZXJ5JTIwY2hhcmdpbmd8ZW58MXx8fHwxNzY4OTI3MTk0fDA&ixlib=rb-4.1.0&q=80&w=1080'
    WHEN 'hair-trigger' THEN 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjB0cmlnZ2VyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080'
    WHEN 'custom-shell' THEN 'https://images.unsplash.com/photo-1542751371-adc38448a05e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBjb250cm9sbGVyfGVufDF8fHx8MTc2ODkyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080'
    ELSE NULL
  END
WHERE subtitle IS NULL;
