// Type definitions for Daum Postcode API
// Documentation: https://postcode.map.daum.net/guide

declare global {
  interface Window {
    daum?: {
      Postcode: new (config: DaumPostcodeConfig) => DaumPostcodeInstance
    }
  }
}

export interface DaumPostcodeData {
  zonecode: string // 우편번호 (5자리)
  address: string // 기본 주소 (도로명 주소)
  addressEnglish: string // 영문 주소
  addressType: 'R' | 'J' // R: 도로명, J: 지번
  userSelectedType: 'R' | 'J' // 사용자가 선택한 주소 타입
  roadAddress: string // 도로명 주소
  jibunAddress: string // 지번 주소
  bname: string // 법정동/법정리 이름
  buildingName: string // 건물명
  apartment: 'Y' | 'N' // 아파트 여부
  autoRoadAddress: string // 도로명 주소 (자동)
  autoJibunAddress: string // 지번 주소 (자동)
  sido: string // 시도
  sigungu: string // 시군구
  sigunguCode: string // 시군구 코드
  roadnameCode: string // 도로명 코드
  bcode: string // 법정동/법정리 코드
  roadname: string // 도로명
  buildingCode: string // 건물관리번호
  postcode: string // 구 우편번호 (6자리)
  postcode1: string // 우편번호 앞 3자리
  postcode2: string // 우편번호 뒤 3자리
  postcodeSeq: string // 우편번호 일련번호
  query: string // 검색어
  userLanguageType: 'K' | 'E' // K: 한글, E: 영문
}

export interface DaumPostcodeConfig {
  oncomplete: (data: DaumPostcodeData) => void // 검색 완료 후 콜백
  onclose?: (state: 'COMPLETE_CLOSE' | 'FORCE_CLOSE') => void // 우편번호 창 닫을 때 콜백
  onsearch?: (data: { q: string; count: number }) => void // 검색 시작 시 콜백
  onresize?: (size: { width: number; height: number }) => void // 크기 변경 시 콜백
  width?: number | string // 너비 (기본: 100%)
  height?: number | string // 높이 (기본: 400px)
  animation?: boolean // 애니메이션 효과 (기본: false)
  focusInput?: boolean // 검색창 포커스 (기본: true)
  focusContent?: boolean // 컨텐츠 포커스 (기본: true)
  autoMapping?: boolean // 자동 매핑 (기본: false)
  autoClose?: boolean // 자동 닫기 (기본: false)
  shorthand?: boolean // 단축키 사용 (기본: true)
  pleaseReadGuide?: number // 가이드 노출 횟수 (기본: 0)
  pleaseReadGuideTimer?: number // 가이드 노출 시간 (기본: 1.5초)
  maxSuggestItems?: number // 자동완성 최대 개수 (기본: 10)
  showMoreHName?: boolean // 상세 주소 노출 (기본: false)
  hideMapBtn?: boolean // 지도 버튼 숨김 (기본: false)
  hideEngBtn?: boolean // 영문 주소 버튼 숨김 (기본: false)
  alwaysShowEngAddr?: boolean // 영문 주소 항상 노출 (기본: false)
  zonecodeOnly?: boolean // 우편번호만 검색 (기본: false)
  theme?: {
    bgColor?: string // 배경색
    searchBgColor?: string // 검색창 배경색
    contentBgColor?: string // 컨텐츠 배경색
    pageBgColor?: string // 페이지 배경색
    textColor?: string // 글자색
    queryTextColor?: string // 검색어 글자색
    postcodeTextColor?: string // 우편번호 글자색
    emphTextColor?: string // 강조 글자색
    outlineColor?: string // 테두리색
  }
}

export interface DaumPostcodeInstance {
  embed: (element: HTMLElement | null, options?: { q?: string; autoClose?: boolean }) => void
  open: (options?: { q?: string; left?: number; top?: number; popupName?: string }) => void
}

export {}
