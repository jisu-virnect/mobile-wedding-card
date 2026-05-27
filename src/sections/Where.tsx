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

/* Inline app-style SVG marks. Hand-tuned to feel like the real Kakao
   Maps / Naver Map / TMAP marques without using the actual trademarked
   logos: a pin for Kakao Map, the N letter for Naver, an arrow-T for
   TMAP. Drawn at 24×24 viewbox for crisp scaling. */
function KakaoMapMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M12 2.5c-3.86 0-7 2.95-7 6.6 0 4.95 7 12.4 7 12.4s7-7.45 7-12.4c0-3.65-3.14-6.6-7-6.6zm0 9.2a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z" />
    </svg>
  )
}

function NaverMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M6 4v16h4.4v-9.1L14.6 20H18V4h-4.4v9.1L9.4 4H6z" />
    </svg>
  )
}

function TmapMark() {
  // Clean bold "T" — TMAP brand mark is essentially a single capital T.
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M4 4h16v3.5h-6.25V20h-3.5V7.5H4V4z" />
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
  className: string
  icon: React.ReactNode
}

function MapPill({ href, ariaLabel, label, className, icon }: MapPillProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-medium tracking-tight shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:brightness-[0.95] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong ' +
        className
      }
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
            className="bg-[#FEE500] text-[#3A1D1D]"
            icon={<KakaoMapMark />}
          />
        )}
        {naverMapUrl && (
          <MapPill
            href={naverMapUrl}
            ariaLabel="네이버지도로 열기"
            label="네이버지도"
            className="bg-[#03C75A] text-white"
            icon={<NaverMark />}
          />
        )}
        {tmapUrl && (
          <MapPill
            href={tmapUrl}
            ariaLabel="티맵으로 길찾기"
            label="티맵"
            className="bg-[#00C7B0] text-white"
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
