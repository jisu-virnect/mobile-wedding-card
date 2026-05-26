import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  rsvpDefaults,
  rsvpSchema,
  type RsvpFormValues,
} from '../lib/rsvpSchema'
import { SectionHeader } from './SectionHeader'

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

async function postRsvp(payload: unknown) {
  const res = await fetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`request failed: ${res.status}`)
  }
  return res.json()
}

export function Rsvp() {
  const reduce = useReducedMotion()
  const [state, setState] = useState<SubmitState>({ status: 'idle' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: rsvpDefaults,
    mode: 'onBlur',
  })

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  const onSubmit = handleSubmit(async (values) => {
    setState({ status: 'submitting' })
    try {
      await postRsvp({
        ...values,
        attending: values.attending === 'yes',
        guests: Number(values.guests),
      })
      setState({
        status: 'success',
        message: '참석 여부를 전달했어요. 감사합니다.',
      })
      reset(rsvpDefaults)
    } catch {
      setState({
        status: 'error',
        message:
          '네트워크 문제로 전송에 실패했어요. 잠시 후 다시 시도해주세요.',
      })
    }
  })

  const inputCls =
    'w-full rounded-sm border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-sage focus:ring-2 focus:ring-sage-soft'

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-heading"
      className="px-6 pt-24 pb-20 text-center"
    >
      <SectionHeader
        index="07"
        title="함께해 주세요"
        subtitle="정성껏 준비한 자리에 함께해 주실 수 있다면 미리 알려주세요."
        headingId="rsvp-heading"
      />

      <motion.form
        {...fade}
        onSubmit={onSubmit}
        noValidate
        aria-label="참석 여부 전달 폼"
        className="mx-auto grid max-w-sm gap-5 text-left"
      >
        <div>
          <label
            htmlFor="rsvp-name"
            className="mb-1 block text-[13px] tracking-wide text-ink-mute"
          >
            이름 <span className="text-sage-strong">*</span>
          </label>
          <input
            id="rsvp-name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'rsvp-name-error' : undefined}
            {...register('name')}
            className={inputCls}
          />
          {errors.name && (
            <p
              id="rsvp-name-error"
              role="alert"
              className="mt-1 text-xs text-sun"
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <fieldset className="rounded-sm border border-line bg-paper p-3">
          <legend className="px-1 text-[13px] tracking-wide text-ink-mute">
            어느 쪽 손님이신가요?{' '}
            <span className="text-ink-mute/70">(선택)</span>
          </legend>
          <div className="mt-1 flex gap-5 text-sm text-ink-soft">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="groom"
                {...register('side')}
                className="h-4 w-4 accent-sage-strong"
              />
              신랑측
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="bride"
                {...register('side')}
                className="h-4 w-4 accent-sage-strong"
              />
              신부측
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-sm border border-line bg-paper p-3">
          <legend className="px-1 text-[13px] tracking-wide text-ink-mute">
            참석 여부 <span className="text-sage-strong">*</span>
          </legend>
          <div className="mt-1 flex gap-5 text-sm text-ink-soft">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="yes"
                {...register('attending')}
                className="h-4 w-4 accent-sage-strong"
              />
              참석
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="no"
                {...register('attending')}
                className="h-4 w-4 accent-sage-strong"
              />
              불참
            </label>
          </div>
          {errors.attending && (
            <p role="alert" className="mt-2 text-xs text-sun">
              {errors.attending.message}
            </p>
          )}
        </fieldset>

        <div>
          <label
            htmlFor="rsvp-guests"
            className="mb-1 block text-[13px] tracking-wide text-ink-mute"
          >
            참석 인원{' '}
            <span className="text-ink-mute/70">(본인 포함)</span>
          </label>
          <input
            id="rsvp-guests"
            type="number"
            inputMode="numeric"
            min={0}
            max={10}
            aria-invalid={errors.guests ? 'true' : undefined}
            aria-describedby={errors.guests ? 'rsvp-guests-error' : undefined}
            {...register('guests', { valueAsNumber: true })}
            className={inputCls}
          />
          {errors.guests && (
            <p
              id="rsvp-guests-error"
              role="alert"
              className="mt-1 text-xs text-sun"
            >
              {errors.guests.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="rsvp-message"
            className="mb-1 block text-[13px] tracking-wide text-ink-mute"
          >
            전하고 싶은 말{' '}
            <span className="text-ink-mute/70">(선택)</span>
          </label>
          <textarea
            id="rsvp-message"
            rows={3}
            {...register('message')}
            className={inputCls + ' resize-none'}
          />
          {errors.message && (
            <p role="alert" className="mt-1 text-xs text-sun">
              {errors.message.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || state.status === 'submitting'}
          aria-label="참석 여부 전달하기"
          className="mt-1 rounded-full bg-sage-strong px-6 py-3 font-serif text-sm font-medium tracking-[0.3em] text-paper transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-sage/40"
        >
          {state.status === 'submitting' ? '전달 중…' : '전달하기'}
        </button>

        <p className="-mt-2 text-center text-[11px] tracking-wide text-ink-mute">
          전달된 정보는 신랑·신부에게만 안내됩니다.
        </p>

        <p
          role="status"
          aria-live="polite"
          className={
            'min-h-[1.25rem] text-center text-xs ' +
            (state.status === 'error'
              ? 'text-sun'
              : state.status === 'success'
                ? 'text-sage-strong'
                : 'text-ink-mute')
          }
        >
          {state.status === 'success' || state.status === 'error'
            ? state.message
            : ''}
        </p>
      </motion.form>
    </section>
  )
}
