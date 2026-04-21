import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import { useClipboard } from '../lib/useClipboard'

function MapPlaceholder({ venueName }: { venueName: string }) {
  return (
    <div
      role="img"
      aria-label={`${venueName} 약도 이미지`}
      className="mx-auto flex aspect-[4/3] w-full max-w-sm items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 ring-1 ring-gray-200"
    >
      <svg
        aria-hidden="true"
        className="h-12 w-12 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
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

  const { name, address, detail, kakaoMapUrl, naverMapUrl } = wedding.venue

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
      className="px-6 py-20 text-center"
    >
      <motion.h2
        id="where-heading"
        {...fade}
        className="mb-8 text-xl font-semibold tracking-wide text-gray-900"
      >
        오시는 길
      </motion.h2>

      <motion.div {...fade} className="mb-6">
        <MapPlaceholder venueName={name} />
      </motion.div>

      <motion.div {...fade} className="space-y-1">
        <p className="text-base font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-700">{address}</p>
        {detail && <p className="text-xs text-gray-500">{detail}</p>}
      </motion.div>

      <motion.div
        {...fade}
        className="mt-6 flex flex-wrap items-center justify-center gap-2"
      >
        {kakaoMapUrl && (
          <a
            href={kakaoMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="카카오맵으로 열기"
            className="inline-flex items-center gap-1 rounded-full bg-yellow-300 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-yellow-200"
          >
            카카오맵
          </a>
        )}
        {naverMapUrl && (
          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="네이버지도로 열기"
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            네이버지도
          </a>
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="주소 복사"
          className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
        >
          주소 복사
        </button>
      </motion.div>

      <p
        role="status"
        aria-live="polite"
        className={
          'mt-3 min-h-[1.25rem] text-xs ' +
          (error ? 'text-rose-700' : 'text-gray-700')
        }
      >
        {feedback}
      </p>
    </section>
  )
}
