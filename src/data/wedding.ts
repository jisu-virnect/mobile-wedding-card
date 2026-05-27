export interface BankAccount {
  bank: string
  number: string
  holder: string
}

/** Optional account info for a parent. Falsy → parent's row is omitted. */
export interface ParentAccount {
  name: string
  account?: BankAccount
}

export interface Person {
  name: string
  father: string
  mother: string
  /** Bride/groom's own phone (used for tel: + sms: buttons in Greeting). */
  phone?: string
  /** Father/mother phones — same buttons rendered next to their names. */
  fatherPhone?: string
  motherPhone?: string
  account?: BankAccount
  fatherAccount?: BankAccount
  motherAccount?: BankAccount
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
  /** Short video clips mixed into the photo gallery. Omit to skip. */
  videos?: VideoItem[]
  cover: {
    /** Slides that cross-fade on the cover hero. 1+ entries; 3-5 recommended. */
    slides: CoverSlide[]
    /** ms each slide stays before crossfading. Default 5000. */
    interval?: number
  }
  /**
   * Optional background music. Omit (or set to undefined) to hide the toggle
   * entirely. Drop the audio file into `public/` and reference it here.
   *
   * Recommended free sources (no attribution needed):
   *   - Pixabay Music: https://pixabay.com/music/search/wedding/
   *   - YouTube Audio Library (login → Audio library)
   *   - FreePD: https://freepd.com/
   *   - Bensound (with attribution): https://www.bensound.com/
   *
   * Mood: 잔잔한 피아노 / 어쿠스틱 기타 / 스트링 / 보사노바. 30~60s loop OK.
   */
  bgm?: BgmConfig
}

export interface VideoItem {
  src: string
  /** Static frame shown as the thumbnail (and lightbox poster). */
  poster: string
  alt: string
}

export interface BgmConfig {
  /** Path under /public, e.g. '/bgm.mp3'. */
  src: string
  /** 0.0 ~ 1.0, default 0.5. Pick a low value — BGM should be ambient. */
  volume?: number
  /** Optional title shown in the toggle tooltip. */
  title?: string
}

export interface CoverSlide {
  src: string
  /** CSS object-position. Tune if a face crops oddly in the 2:3 frame. */
  objectPosition?: string
}

export const wedding: WeddingInfo = {
  groom: {
    name: '김지수',
    father: '김창길',
    mother: '김영미',
    // TODO(jisu): 실제 번호로 교체. 필드 삭제하면 ☎/✉ 버튼이 안 보임.
    phone: '010-0000-0000',
    fatherPhone: '010-0000-0000',
    motherPhone: '010-0000-0000',
    account: { bank: '신한은행', number: '110-223-048839', holder: '김지수' },
    fatherAccount: {
      bank: '농협',
      number: '207170-56-075207',
      holder: '김창길',
    },
    motherAccount: {
      bank: '농협',
      number: '207055-52-054915',
      holder: '김영미',
    },
  },
  bride: {
    name: '김난슬',
    father: '김청섭',
    mother: '이경화',
    phone: '010-0000-0000',
    fatherPhone: '010-0000-0000',
    motherPhone: '010-0000-0000',
    account: {
      bank: '카카오뱅크',
      number: '3333-30-4385686',
      holder: '김난슬',
    },
    fatherAccount: {
      bank: '농협은행',
      number: '356-1314-3461-83',
      holder: '김청섭',
    },
    motherAccount: {
      bank: '우리은행',
      number: '1002-734-147623',
      holder: '이경화',
    },
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
  // Drop video clips into `public/videos/` and uncomment to enable.
  // Each video should be MP4 H.264 baseline, 480p, 30s max, 3~5MB.
  // The `poster` should be a still frame (JPEG, ~150KB) for fast thumbnails.
  videos: [
    { src: '/videos/01.mp4', poster: '/videos/01.jpg', alt: '본식 하이라이트' },
    { src: '/videos/02.mp4', poster: '/videos/02.jpg', alt: '프로포즈 순간' },
  ],
  cover: {
    // Cover slides use a smaller resized variant (~100-200KB each) instead
    // of the full gallery jpegs (~300KB) to keep LCP fast. The lightbox
    // gallery still uses the full /gallery/NN.jpg.
    // Regenerate via: node scripts/gen-cover-slides.mjs
    slides: [
      { src: '/cover-01.jpg', objectPosition: 'center' },
      { src: '/cover-12.jpg', objectPosition: 'center' },
      { src: '/cover-23.jpg', objectPosition: 'center' },
    ],
    interval: 5000,
  },
  // BGM: drop /public/bgm.mp3 (or change the path) and uncomment.
  // The toggle button only renders when this field is defined, so the
  // section stays clean until you've actually picked music.
  bgm: { src: '/bgm.mp3', volume: 0.4, title: '잔잔한 피아노' },
}
