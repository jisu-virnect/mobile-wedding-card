// Thin runtime adapter for Kakao JavaScript SDK (Kakaotalk Sharing v2).
//
// The SDK is loaded lazily — only injected if VITE_KAKAO_JS_KEY is set at
// build time. Without the env var, `kakaoShare()` falls back gracefully
// (returns false) and the caller can pick another share path.
//
// Setup (one-time, ~5 min):
//   1. https://developers.kakao.com → 내 애플리케이션 → 추가하기
//   2. 앱 설정 → 플랫폼 → Web 도메인에 배포 URL 등록
//      (예: https://jisu-nanseul.vercel.app)
//   3. 앱 키 → JavaScript 키 복사
//   4. .env.local 에 추가: VITE_KAKAO_JS_KEY=발급받은_키
//   5. 재배포 → 카카오톡 공유 버튼 정상 동작

declare global {
  interface Window {
    Kakao?: KakaoSdk
  }
}

interface KakaoSdk {
  isInitialized(): boolean
  init(key: string): void
  Share?: {
    sendDefault(options: KakaoShareOptions): void
  }
}

interface KakaoShareOptions {
  objectType: 'feed'
  content: {
    title: string
    description: string
    imageUrl: string
    link: { mobileWebUrl: string; webUrl: string }
  }
  buttons?: Array<{
    title: string
    link: { mobileWebUrl: string; webUrl: string }
  }>
}

const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
const SDK_INTEGRITY =
  'sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka'

let loadPromise: Promise<boolean> | null = null

function getKey(): string | undefined {
  // Vite inlines import.meta.env.VITE_* at build time.
  const k = (import.meta.env as Record<string, string | undefined>)
    .VITE_KAKAO_JS_KEY
  return typeof k === 'string' && k.length > 0 ? k : undefined
}

export function isKakaoConfigured(): boolean {
  return getKey() !== undefined
}

/**
 * Lazily injects the Kakao SDK script and initializes it with the env key.
 * Resolves true when ready, false when no key is configured or load failed.
 */
export function ensureKakao(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  const key = getKey()
  if (!key) return Promise.resolve(false)
  if (window.Kakao?.isInitialized()) return Promise.resolve(true)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.integrity = SDK_INTEGRITY
    script.crossOrigin = 'anonymous'
    script.async = true
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(key)
      }
      resolve(Boolean(window.Kakao?.isInitialized()))
    }
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
  return loadPromise
}

export interface KakaoShareArgs {
  title: string
  description: string
  imageUrl: string
  url: string
  buttonLabel?: string
}

/**
 * Opens the Kakao share sheet with the given metadata.
 * Returns true on success, false if Kakao is unavailable.
 */
export async function kakaoShare(args: KakaoShareArgs): Promise<boolean> {
  const ok = await ensureKakao()
  if (!ok || !window.Kakao?.Share) return false
  try {
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: args.title,
        description: args.description,
        imageUrl: args.imageUrl,
        link: { mobileWebUrl: args.url, webUrl: args.url },
      },
      buttons: [
        {
          title: args.buttonLabel ?? '청첩장 보기',
          link: { mobileWebUrl: args.url, webUrl: args.url },
        },
      ],
    })
    return true
  } catch {
    return false
  }
}
