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
    /** Optional one-liner subtitle below the address (deprecated by `transit`). */
    detail?: string
    /** Structured transit info — rendered as the "오시는 방법" subsection. */
    transit?: {
      subway?: string
      busStops?: BusStop[]
      parking?: string
    }
    kakaoMapUrl?: string
    naverMapUrl?: string
    /** Deep link to TMAP mobile nav app (`tmap://search?name=...`). */
    tmapUrl?: string
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
  /**
   * Regional pre-wedding gathering (앞잔치) — typically for the bride's side
   * family + relatives who can't travel to the main venue. Optional;
   * omit to hide the section entirely.
   */
  preEvent?: PreEvent
}

export interface BusStop {
  /** "수원시청역 1번 출구 (국민연금공단)" 같은 정류장 라벨. */
  name: string
  /** "51 · 52 · 61" 식으로 렌더되는 일반 노선. */
  routes: string[]
  /** "직행 3002 · 4000" 식으로 별도 줄로 렌더되는 직행/광역. */
  express?: string[]
}

export interface PreEvent {
  /** Multi-line explanation/audience note. \n preserved. */
  description: string
  /** Small line right after the description, e.g. "혼주 ... 올림". */
  signoff?: string
  dateTime: string
  /** Optional override when the actual date is still TBD. */
  dateDisplay?: string
  /** Optional override for time display (e.g. "오후 1시부터"). */
  timeDisplay?: string
  venue: {
    name: string
    address: string
    detail?: string
    kakaoMapUrl?: string
    naverMapUrl?: string
  }
  /** Optional 마음 전하는 곳 — one card per entry. */
  accounts?: PreEventAccount[]
}

export interface PreEventAccount {
  /** Role label shown on the card header (e.g. "신부", "신부 아버지"). */
  role: string
  account: BankAccount
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
    name: '호텔라뷔포레 (구 호텔리츠)',
    address: '경기도 수원시 팔달구 권광로134번길 46',
    transit: {
      subway: '수인분당선 수원시청역 1번 출구 · 도보 3분',
      busStops: [
        {
          name: '수원시청역 1번 출구 (국민연금공단)',
          routes: ['51', '52', '61', '80', '81', '82-1', '85'],
        },
        {
          name: '수원시청역 2번 출구 (벽산그랜드코아 앞)',
          routes: ['13-1', '18', '52', '80', '99-2', '202', '201-1'],
          express: ['3002', '4000', '7002'],
        },
        {
          name: '수원시청역 3번 출구 (서울보증보험 앞)',
          routes: ['13-1', '18', '52', '80', '99-2', '202', '202-1'],
          express: ['3002', '4000', '7001'],
        },
      ],
      parking: '주차 가능',
    },
    kakaoMapUrl: 'https://map.kakao.com/?q=호텔라뷔포레',
    naverMapUrl: 'https://map.naver.com/p/search/호텔라뷔포레',
    tmapUrl: 'tmap://search?name=호텔라뷔포레',
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
  // 피로연 (regional reception in 고창 for the bride's side).
  // Section only renders if preEvent is defined.
  // TODO: 실제 날짜·요일 확정 후 dateTime 갱신.
  preEvent: {
    description:
      '수원까지 오시기 어려운 신부측 손님을 위해\n고창에 먼저 자리를 마련하였습니다.\n\n결혼식에 앞서 식사대접을 하고자 하니\n부담 갖지 마시고 편한 마음으로 오셔서\n축하해 주시면 더 없는 기쁨이 되겠습니다.',
    signoff: '혼주 김청섭 · 이경화 올림',
    dateTime: '2026-10-01T13:00:00+09:00',
    dateDisplay: '2026년 10월 · 날짜 추후 안내',
    timeDisplay: '오후 1시부터',
    venue: {
      name: '상하 실내체육관',
      address: '전라북도 고창군 상하면 선운대로 810',
    },
    accounts: [
      {
        role: '신부',
        account: {
          bank: '카카오뱅크',
          number: '3333-30-4385686',
          holder: '김난슬',
        },
      },
      {
        role: '신부 아버지',
        account: {
          bank: '농협',
          number: '356-1314-3461-83',
          holder: '김청섭',
        },
      },
    ],
  },
}
