export interface Person {
  name: string
  father: string
  mother: string
  phone?: string
  account?: BankAccount
}

export interface BankAccount {
  bank: string
  number: string
  holder: string
}

export interface WeddingInfo {
  groom: Person
  bride: Person
  dateTime: string
  venue: {
    name: string
    address: string
    detail?: string
    kakaoMapUrl?: string
    naverMapUrl?: string
  }
  invitation: string
  gallery: string[]
}

export const wedding: WeddingInfo = {
  groom: {
    name: '김지수',
    father: '김창길',
    mother: '김영미',
    account: { bank: '신한은행', number: '110-000-000000', holder: '김지수' },
  },
  bride: {
    name: '김난슬',
    father: '김청섭',
    mother: '이경화',
    account: { bank: '국민은행', number: '000-000-000000', holder: '김난슬' },
  },
  dateTime: '2026-11-28T13:00:00+09:00',
  venue: {
    name: '호텔 라뷔포레',
    address: '경기도 수원시 팔달구 권광로134번길 44-11',
    detail: '수원시청역 2번 출구에서 도보 10분 · 수원역에서 택시 약 10분',
    kakaoMapUrl: 'https://map.kakao.com/?q=호텔라뷔포레',
    naverMapUrl: 'https://map.naver.com/p/search/호텔라뷔포레',
  },
  invitation:
    '저희 두 사람의 소중한 만남이\n사랑과 이해로 이어져\n한 가정을 이루게 되었습니다.\n\n평생을 함께하기로 약속하는 자리에\n귀한 걸음으로 축복해 주시면\n큰 기쁨이겠습니다.\n\n김지수 · 김난슬 드림',
  gallery: Array.from({ length: 34 }, (_, i) => `/gallery/${String(i + 1).padStart(2, '0')}.jpg`),
}
