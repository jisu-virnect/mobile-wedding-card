import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  rsvpDefaults,
  rsvpSchema,
  type RsvpFormValues,
} from '../lib/rsvpSchema'

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
        message: '참석 여부를 전달했어요. 감사합니다 💐',
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

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-heading"
      className="px-6 py-20 text-center"
    >
      <motion.h2
        id="rsvp-heading"
        {...fade}
        className="mb-6 text-xl font-semibold tracking-wide text-gray-900"
      >
        참석 여부 전달
      </motion.h2>
      <motion.p
        {...fade}
        className="mx-auto mb-8 max-w-sm text-sm text-gray-600"
      >
        정성껏 준비한 자리에 함께해 주실 수 있다면 미리 알려주세요.
      </motion.p>

      <motion.form
        {...fade}
        onSubmit={onSubmit}
        noValidate
        aria-label="참석 여부 전달 폼"
        className="mx-auto grid max-w-sm gap-4 text-left"
      >
        <div>
          <label htmlFor="rsvp-name" className="mb-1 block text-xs text-gray-600">
            이름 <span className="text-rose-600">*</span>
          </label>
          <input
            id="rsvp-name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'rsvp-name-error' : undefined}
            {...register('name')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          {errors.name && (
            <p
              id="rsvp-name-error"
              role="alert"
              className="mt-1 text-xs text-rose-600"
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <fieldset className="rounded-md border border-gray-200 p-3">
          <legend className="px-1 text-xs text-gray-600">소속</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" value="groom" {...register('side')} />
              신랑측
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="bride" {...register('side')} />
              신부측
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-md border border-gray-200 p-3">
          <legend className="px-1 text-xs text-gray-600">참석 여부</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" value="yes" {...register('attending')} />
              참석
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="no" {...register('attending')} />
              불참
            </label>
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="rsvp-guests"
            className="mb-1 block text-xs text-gray-600"
          >
            동반 인원 (본인 포함)
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          {errors.guests && (
            <p
              id="rsvp-guests-error"
              role="alert"
              className="mt-1 text-xs text-rose-600"
            >
              {errors.guests.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="rsvp-message"
            className="mb-1 block text-xs text-gray-600"
          >
            전하고 싶은 말
          </label>
          <textarea
            id="rsvp-message"
            rows={3}
            {...register('message')}
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          {errors.message && (
            <p role="alert" className="mt-1 text-xs text-rose-600">
              {errors.message.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || state.status === 'submitting'}
          className="mt-2 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
        >
          {state.status === 'submitting' ? '전송 중…' : '참석 여부 전달하기'}
        </button>

        <p
          role="status"
          aria-live="polite"
          className={
            'min-h-[1.25rem] text-xs ' +
            (state.status === 'error'
              ? 'text-rose-700'
              : state.status === 'success'
                ? 'text-emerald-700'
                : 'text-gray-600')
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
