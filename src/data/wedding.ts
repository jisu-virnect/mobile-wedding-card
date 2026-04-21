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
    name: '김철수',
    father: '김아버지',
    mother: '김어머니',
    account: { bank: '신한은행', number: '110-123-456789', holder: '김철수' },
  },
  bride: {
    name: '이영희',
    father: '이아버지',
    mother: '이어머니',
    account: { bank: '국민은행', number: '123-45-6789-012', holder: '이영희' },
  },
  dateTime: '2026-10-10T11:00:00+09:00',
  venue: {
    name: '샘플 웨딩홀 5F 그랜드볼룸',
    address: '서울특별시 중구 샘플로 123',
    detail: '지하철 2호선 샘플역 3번 출구 도보 5분',
    kakaoMapUrl: 'https://map.kakao.com/',
    naverMapUrl: 'https://map.naver.com/',
  },
  invitation:
    '저희 두 사람의 작은 만남이 커다란 사랑으로 이루어져\n참된 사랑과 이해로써 하나의 가정을 이루게 되었습니다.\n평생을 함께할 것을 약속하는 날, 함께 축복해 주시면 감사하겠습니다.',
  gallery: [],
}
