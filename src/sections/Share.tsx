import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import { useClipboard } from '../lib/useClipboard'

function hasWebShare(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof (navigator as Navigator & { share?: unknown }).share === 'function'
  )
}

export function Share() {
  const reduce = useReducedMotion()
  const { copy } = useClipboard(2500)
  const [supported] = useState(hasWebShare)
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  const shareTitle = `${wedding.groom.name} ♥ ${wedding.bride.name} 결혼식 초대`
  const shareText = '저희의 결혼식에 초대합니다.'
  const shareUrl =
    typeof window !== 'undefined' ? window.location.href : ''

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      })
      setFeedback({ kind: 'success', message: '공유 시트를 열었어요.' })
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setFeedback(null)
        return
      }
      setFeedback({
        kind: 'error',
        message: '공유를 완료하지 못했어요. 링크 복사를 이용해 주세요.',
      })
    }
  }

  const handleCopyLink = async () => {
    const ok = await copy(shareUrl)
    setFeedback(
      ok
        ? { kind: 'success', message: '링크를 복사했어요. 원하는 곳에 붙여넣어 전해주세요.' }
        : {
            kind: 'error',
            message: '복사에 실패했어요. 주소 표시줄에서 직접 복사해 주세요.',
          },
    )
  }

  return (
    <section
      id="share"
      aria-labelledby="share-heading"
      className="px-6 py-20 text-center"
    >
      <motion.h2
        id="share-heading"
        {...fade}
        className="mb-2 text-xl font-semibold tracking-wide text-gray-900"
      >
        청첩장 공유하기
      </motion.h2>
      <motion.p {...fade} className="mb-8 text-xs text-gray-500">
        주변 분들께 이 초대장을 전해주세요.
      </motion.p>

      <motion.div
        {...fade}
        className="mx-auto flex max-w-sm flex-wrap items-center justify-center gap-2"
      >
        {supported && (
          <button
            type="button"
            onClick={handleNativeShare}
            aria-label="기기 공유 시트로 공유하기"
            className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            공유하기
          </button>
        )}
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="초대장 링크 복사"
          className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          링크 복사
        </button>
      </motion.div>

      <p
        role="status"
        aria-live="polite"
        className={
          'mx-auto mt-4 min-h-[1.25rem] max-w-sm text-xs ' +
          (feedback?.kind === 'error' ? 'text-rose-500' : 'text-emerald-600')
        }
      >
        {feedback?.message ?? ''}
      </p>
    </section>
  )
}
