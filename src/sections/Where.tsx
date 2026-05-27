import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { BusStop } from '../data/wedding'
import { useClipboard } from '../lib/useClipboard'
import { KakaoMap } from './KakaoMap'
import { SectionHeader } from './SectionHeader'

function MapPlaceholder({ venueName }: { venueName: string }) {
  return (
    <div
      role="img"
      aria-label={`${venueName} 약도 이미지`}
      className="mx-auto flex aspect-[4/3] w-full max-w-sm items-center justify-center rounded-sm bg-paper ring-1 ring-line"
    >
      <svg
        aria-hidden="true"
        className="h-10 w-10 text-sage/70"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
      </svg>
    </div>
  )
}

/* App-icon style marks. Kakao uses the real favicon PNG that's already
   in public/map/. Naver + TMAP use SVG with system-bold letters inside
   the brand-color rounded square — cleaner and more legible than the
   hand-drawn path glyphs that read as "lookalike but off".
   To upgrade Naver/TMAP to real PNGs: drop them at
   public/map/naver-map.png and public/map/tmap.png, then mirror the
   KakaoMapMark <img> pattern below. */
function KakaoMapMark() {
  return (
    <img
      src="/map/kakao.png"
      alt=""
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
    />
  )
}

function NaverMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
    >
      <rect width="24" height="24" rx="6" fill="#03C75A" />
      <text
        x="12"
        y="18"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="16"
        fontWeight="900"
        fill="white"
      >
        N
      </text>
    </svg>
  )
}

function TmapMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
    >
      <rect width="24" height="24" rx="6" fill="#F71668" />
      <text
        x="12"
        y="18"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="16"
        fontWeight="900"
        fill="white"
      >
        T
      </text>
    </svg>
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

interface MapPillProps {
  href: string
  ariaLabel: string
  label: string
  icon: React.ReactNode
}

function MapPill({ href, ariaLabel, label, icon }: MapPillProps) {
  // All three pills share one paper+outline shell so the colored app
  // icons inside become the visual identifier (instead of brand-color
  // pills crashing into the invitation's sage/paper palette).
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[12px] font-medium tracking-tight text-ink shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition hover:bg-sage-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
    >
      {icon}
      {label}
    </a>
  )
}

function TransitLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[12px] tracking-[0.35em] text-ink-mute uppercase">
      {children}
    </p>
  )
}

function BusStopBlock({ stop }: { stop: BusStop }) {
  return (
    <div className="space-y-1">
      <p className="text-[13px] text-ink-mute break-keep">{stop.name}</p>
      <p className="font-serif text-[15px] tracking-[0.02em] text-ink-soft break-keep">
        {stop.routes.join(' · ')}
      </p>
      {stop.express && stop.express.length > 0 && (
        <p className="font-serif text-[14px] tracking-[0.02em] text-ink-mute break-keep">
          직행 {stop.express.join(' · ')}
        </p>
      )}
    </div>
  )
}

export function Where() {
  const reduce = useReducedMotion()
  const { copy, copied, error } = useClipboard()

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  const {
    name,
    address,
    detail,
    transit,
    kakaoMapUrl,
    naverMapUrl,
    tmapUrl,
  } = wedding.venue

  const handleCopy = () => {
    void copy(address)
  }

  const feedback = error
    ? '주소 복사에 실패했어요. 길게 눌러 직접 복사해주세요.'
    : copied
      ? '주소를 복사했어요.'
      : ''

  return (
    <section
      id="where"
      aria-labelledby="where-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="04"
        title="오시는 길"
        headingId="where-heading"
      />

      <motion.div {...fade} className="mb-6">
        <KakaoMap
          address={address}
          venueName={name}
          fallback={<MapPlaceholder venueName={name} />}
        />
      </motion.div>

      <motion.div {...fade} className="space-y-1.5 break-keep">
        <p className="font-serif text-xl text-ink">{name}</p>
        <p className="text-[15px] text-ink-soft">{address}</p>
        {detail && (
          <p className="mx-auto max-w-[30ch] text-[13px] leading-relaxed text-ink-mute">
            {detail}
          </p>
        )}
      </motion.div>

      <motion.div
        {...fade}
        className="mt-7 flex flex-nowrap items-center justify-center gap-1.5"
      >
        {kakaoMapUrl && (
          <MapPill
            href={kakaoMapUrl}
            ariaLabel="카카오맵으로 열기"
            label="카카오맵"
            icon={<KakaoMapMark />}
          />
        )}
        {naverMapUrl && (
          <MapPill
            href={naverMapUrl}
            ariaLabel="네이버지도로 열기"
            label="네이버지도"
            icon={<NaverMark />}
          />
        )}
        {tmapUrl && (
          <MapPill
            href={tmapUrl}
            ariaLabel="티맵으로 길찾기"
            label="티맵"
            icon={<TmapMark />}
          />
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="주소 복사"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1.5 text-[12px] font-medium tracking-tight text-ink-soft shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:bg-sage-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
        >
          <CopyIcon />
          주소 복사
        </button>
      </motion.div>

      <p
        role="status"
        aria-live="polite"
        className={
          'mt-3 min-h-[1.25rem] text-xs ' +
          (error ? 'text-sun' : 'text-ink-soft')
        }
      >
        {feedback}
      </p>

      {transit && (
        <motion.div {...fade} className="mt-10 space-y-7 text-left">
          <div
            aria-hidden="true"
            className="flex items-center justify-center gap-3"
          >
            <span className="h-px w-12 bg-line" />
            <span className="font-display text-[11px] tracking-[0.5em] text-ink-mute uppercase">
              오시는 방법
            </span>
            <span className="h-px w-12 bg-line" />
          </div>

          {transit.subway && (
            <div className="mx-auto max-w-sm space-y-1.5">
              <TransitLabel>지하철</TransitLabel>
              <p className="font-serif text-[15px] text-ink break-keep">
                {transit.subway}
              </p>
            </div>
          )}

          {transit.busStops && transit.busStops.length > 0 && (
            <div className="mx-auto max-w-sm space-y-4">
              <TransitLabel>버스</TransitLabel>
              {transit.busStops.map((stop) => (
                <BusStopBlock key={stop.name} stop={stop} />
              ))}
            </div>
          )}

          {transit.parking && (
            <div className="mx-auto max-w-sm space-y-1.5">
              <TransitLabel>주차</TransitLabel>
              <p className="font-serif text-[15px] text-ink break-keep">
                {transit.parking}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </section>
  )
}
