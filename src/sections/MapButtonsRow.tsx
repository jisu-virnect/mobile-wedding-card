import { useClipboard } from '../lib/useClipboard'

// Toast (success / error) is dispatched globally by useClipboard, so this
// component no longer needs its own inline status paragraph.

/* Real App-Store app-icon PNGs, dropped into public/map/ by the user.
   Rendered at h-9 w-9 (36px) — the icons themselves act as the button,
   so no outer pill shell. rounded-xl matches Apple's squircle so the
   PNG's square edges blend in. */
function KakaoMapMark() {
  return (
    <img
      src="/map/kakao.png"
      alt=""
      aria-hidden="true"
      className="h-9 w-9 shrink-0 rounded-xl"
    />
  )
}

function NaverMark() {
  return (
    <img
      src="/map/naver-map.png"
      alt=""
      aria-hidden="true"
      className="h-9 w-9 shrink-0 rounded-xl"
    />
  )
}

function TmapMark() {
  return (
    <img
      src="/map/tmap.png"
      alt=""
      aria-hidden="true"
      className="h-9 w-9 shrink-0 rounded-xl"
    />
  )
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

interface MapIconLinkProps {
  href: string
  ariaLabel: string
  icon: React.ReactNode
}

function MapIconLink({ href, ariaLabel, icon }: MapIconLinkProps) {
  // No pill shell — the app icon is the button. Tiny focus ring +
  // active opacity for tap feedback. aria-label still announces the
  // app name for screen-reader users.
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="shrink-0 rounded-xl transition active:opacity-70 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
    >
      {icon}
    </a>
  )
}

interface MapButtonsRowProps {
  kakaoMapUrl?: string
  naverMapUrl?: string
  tmapUrl?: string
  /** Plain address text used by the 주소 복사 button. */
  address: string
  /** Optional: customize the copy button's aria-label. Defaults to "주소 복사". */
  copyAriaLabel?: string
}

/**
 * Shared map-shortcut row used by Where + PreEvent. Renders icon-only
 * deep-link buttons for the three map apps + a 주소 복사 pill, plus its
 * own live-region toast so callers don't need to wire one up.
 *
 * Each map button is omitted if its URL is falsy — so a venue with no
 * tmapUrl just shows the other three.
 */
export function MapButtonsRow({
  kakaoMapUrl,
  naverMapUrl,
  tmapUrl,
  address,
  copyAriaLabel = '주소 복사',
}: MapButtonsRowProps) {
  const { copy } = useClipboard()

  const handleCopy = () => {
    void copy(address, '주소를')
  }

  return (
    <div className="flex flex-nowrap items-center justify-center gap-2">
      {kakaoMapUrl && (
        <MapIconLink
          href={kakaoMapUrl}
          ariaLabel="카카오맵으로 열기"
          icon={<KakaoMapMark />}
        />
      )}
      {naverMapUrl && (
        <MapIconLink
          href={naverMapUrl}
          ariaLabel="네이버지도로 열기"
          icon={<NaverMark />}
        />
      )}
      {tmapUrl && (
        <MapIconLink
          href={tmapUrl}
          ariaLabel="티맵으로 길찾기"
          icon={<TmapMark />}
        />
      )}
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copyAriaLabel}
        className="inline-flex h-9 items-center gap-1 rounded-full border border-line bg-paper px-3 text-[12px] font-medium tracking-tight text-ink-soft shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition hover:bg-sage-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
      >
        <CopyIcon />
        주소 복사
      </button>
    </div>
  )
}
