import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { wedding } from '../data/wedding'
import { useClipboard } from '../lib/useClipboard'
import { isKakaoConfigured, kakaoShare } from '../lib/kakao'
import { SectionHeader } from './SectionHeader'

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
  const [kakaoEnabled] = useState(isKakaoConfigured)
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

  const shareTitle = `${wedding.groom.name} · ${wedding.bride.name} 결혼식 초대`
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

  const handleKakaoShare = async () => {
    const ogImage =
      typeof window !== 'undefined'
        ? `${window.location.origin}/og-image.jpg`
        : '/og-image.jpg'
    const ok = await kakaoShare({
      title: shareTitle,
      description: shareText,
      imageUrl: ogImage,
      url: shareUrl,
    })
    if (ok) {
      setFeedback({ kind: 'success', message: '카카오톡 공유 창을 열었어요.' })
      return
    }
    // SDK not configured/loaded — degrade to native or copy.
    if (supported) {
      await handleNativeShare()
    } else {
      await handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    const ok = await copy(shareUrl)
    setFeedback(
      ok
        ? {
            kind: 'success',
            message: '링크를 복사했어요. 원하는 곳에 붙여넣어 전해주세요.',
          }
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
      className="px-6 pt-24 pb-28 text-center"
    >
      <SectionHeader
        index="10"
        title="이 초대장 전하기"
        subtitle="주변 분들께 우리의 소식을 전해주세요."
        headingId="share-heading"
      />

      <motion.div
        {...fade}
        className="mx-auto flex max-w-sm flex-wrap items-center justify-center gap-2"
      >
        <button
          type="button"
          onClick={handleKakaoShare}
          aria-label="카카오톡으로 공유하기"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE500] px-5 py-2.5 text-sm font-medium tracking-wide text-[#3a1d1d] transition hover:bg-[#FFD600] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3C6.477 3 2 6.582 2 11c0 2.842 1.857 5.337 4.66 6.788l-1.193 4.358a.5.5 0 0 0 .77.535l5.094-3.388c.218.012.438.02.669.02 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
          </svg>
          카카오톡으로 공유
        </button>
        {supported && (
          <button
            type="button"
            onClick={handleNativeShare}
            aria-label="기기 공유 시트로 공유하기"
            className="inline-flex items-center gap-1.5 rounded-full bg-sage-strong px-5 py-2.5 text-sm font-medium tracking-wide text-paper transition hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-strong"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
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
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-medium tracking-wide text-ink transition hover:bg-sage-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          링크 복사
        </button>
      </motion.div>

      {!kakaoEnabled && (
        <p className="mx-auto mt-3 max-w-sm text-[12px] tracking-wide text-ink-soft">
          카카오톡 공유는 Kakao 개발자 키 설정 후 활성화됩니다 (DEPLOY.md 참고).
        </p>
      )}

      <p
        role="status"
        aria-live="polite"
        className={
          'mx-auto mt-4 min-h-[1.25rem] max-w-sm text-xs ' +
          (feedback?.kind === 'error' ? 'text-sun' : 'text-sage-strong')
        }
      >
        {feedback?.message ?? ''}
      </p>

      <div
        aria-hidden="true"
        className="mx-auto mt-16 flex items-center justify-center gap-3"
      >
        <span className="h-px w-12 bg-line" />
        <span className="font-serif text-[13px] tracking-[0.3em] text-sage-strong">
          감사합니다
        </span>
        <span className="h-px w-12 bg-line" />
      </div>
    </section>
  )
}
