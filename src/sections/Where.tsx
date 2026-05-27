import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import type { BusStop } from '../data/wedding'
import { KakaoMap } from './KakaoMap'
import { MapButtonsRow } from './MapButtonsRow'
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

      <motion.div {...fade} className="mt-7">
        <MapButtonsRow
          kakaoMapUrl={kakaoMapUrl}
          naverMapUrl={naverMapUrl}
          tmapUrl={tmapUrl}
          address={address}
        />
      </motion.div>

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
