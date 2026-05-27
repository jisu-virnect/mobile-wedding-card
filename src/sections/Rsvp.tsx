import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  BRIDE_RELATIONSHIPS,
  GROOM_RELATIONSHIPS,
  RELATIONSHIP_LABELS,
  rsvpDefaults,
  rsvpSchema,
  type Relationship,
  type RsvpFormValues,
} from '../lib/rsvpSchema'
import {
  cancelRsvp,
  fetchMyRsvps,
  submitRsvp,
  type RsvpRow,
} from '../lib/rsvp'
import { hasSupabase } from '../lib/supabase'
import { SectionHeader } from './SectionHeader'

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export function Rsvp() {
  const reduce = useReducedMotion()
  const [myResponses, setMyResponses] = useState<RsvpRow[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [state, setState] = useState<SubmitState>({ status: 'idle' })
  const backendReady = hasSupabase()

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

  // Load any responses this device has already submitted (for the
  // "내가 보낸 응답" card stack above the form).
  useEffect(() => {
    if (!backendReady) return
    fetchMyRsvps()
      .then(setMyResponses)
      .catch(() => {
        /* Quiet — admin will notice if reads fail. */
      })
  }, [backendReady])

  const fade = reduce
    ? { initial: false as const, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  const onSubmit = handleSubmit(async (values) => {
    if (!backendReady) {
      setState({
        status: 'error',
        message:
          'RSVP 기능이 아직 준비 중이에요. 신랑·신부에게 직접 연락 부탁드립니다.',
      })
      return
    }

    // Block accidental double-submit under the same name from this device.
    // If editing, the matched row's own id is allowed — we're updating it.
    const trimmed = values.name.trim()
    const existing = myResponses.find((r) => r.name.trim() === trimmed)
    if (existing && existing.id !== editingId) {
      setState({
        status: 'error',
        message: `${trimmed}님의 응답이 이미 있어요. 수정하시려면 위의 [수정]을 눌러주세요.`,
      })
      return
    }

    setState({ status: 'submitting' })
    try {
      const row = await submitRsvp({
        name: values.name,
        relationship: values.relationship,
        attending: values.attending === 'yes',
        guests: values.guests,
        message: values.message,
      })
      setMyResponses((prev) => {
        const idx = prev.findIndex((r) => r.id === row.id)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = row
          return copy
        }
        return [...prev, row]
      })
      reset(rsvpDefaults)
      setEditingId(null)
      setState({
        status: 'success',
        message: editingId
          ? '응답을 수정했어요. 감사합니다.'
          : '참석 여부를 전달했어요. 감사합니다.',
      })
    } catch (err) {
      // Log the underlying error so a developer can read it in the console
      // — guests see the friendly fallback toast.
      console.error('RSVP submit failed', err)
      setState({
        status: 'error',
        message:
          '네트워크 문제로 전송에 실패했어요. 잠시 후 다시 시도해주세요.',
      })
    }
  })

  const startEdit = (row: RsvpRow) => {
    reset({
      name: row.name,
      relationship: (row.relationship ?? undefined) as Relationship,
      attending: row.attending ? 'yes' : 'no',
      guests: row.guests,
      message: row.message ?? '',
    })
    setEditingId(row.id)
    setState({ status: 'idle' })
    // Scroll the form into view so the user can see it filled in.
    const form = document.getElementById('rsvp-form')
    form?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCancelResponse = async (row: RsvpRow) => {
    const ok = window.confirm(
      `${row.name}님의 응답을 취소하시겠어요? 다시 응답하시려면 폼을 작성해주세요.`,
    )
    if (!ok) return
    try {
      await cancelRsvp(row.id)
      setMyResponses((prev) => prev.filter((r) => r.id !== row.id))
      if (editingId === row.id) {
        setEditingId(null)
        reset(rsvpDefaults)
      }
      setState({ status: 'success', message: '응답을 취소했어요.' })
    } catch {
      setState({
        status: 'error',
        message: '취소에 실패했어요. 잠시 후 다시 시도해주세요.',
      })
    }
  }

  const exitEditMode = () => {
    setEditingId(null)
    reset(rsvpDefaults)
    setState({ status: 'idle' })
  }

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
        title="참석 의사 안내"
        subtitle="정성껏 준비한 자리에 함께해 주실 수 있다면 미리 알려주세요."
        headingId="rsvp-heading"
      />

      {/* "이 디바이스에서 보낸 응답" — only renders when at least one row
         exists for this device. Each card has 수정/취소 actions. */}
      {myResponses.length > 0 && (
        <motion.div
          {...fade}
          className="mx-auto mb-8 grid max-w-sm gap-2 text-left"
          aria-label="이 디바이스에서 보낸 응답"
        >
          <p className="text-center font-display text-[11px] tracking-[0.35em] text-ink-mute uppercase">
            보낸 응답
          </p>
          {myResponses.map((row) => (
            <article
              key={row.id}
              className={
                'rounded-sm border bg-paper px-4 py-3 ' +
                (editingId === row.id
                  ? 'border-sage-strong ring-1 ring-sage'
                  : 'border-line')
              }
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-serif text-[15px] text-ink">
                  {row.name}
                  <span className="ml-2 text-[12px] text-ink-mute">
                    {row.side === 'groom' ? '신랑측' : '신부측'}
                    {row.relationship ? ` · ${row.relationship}` : ''}
                  </span>
                </p>
                <p className="text-[12px] text-ink-soft">
                  {row.attending ? `참석 · ${row.guests}명` : '불참'}
                </p>
              </div>
              {row.message && (
                <p className="mt-1 text-[12px] leading-relaxed text-ink-mute break-keep">
                  {row.message}
                </p>
              )}
              <div className="mt-2 flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-medium text-ink-soft transition hover:bg-sage-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelResponse(row)}
                  className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-medium text-sun transition hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
                >
                  취소
                </button>
              </div>
            </article>
          ))}
        </motion.div>
      )}

      <motion.form
        {...fade}
        id="rsvp-form"
        onSubmit={onSubmit}
        noValidate
        aria-label={editingId ? '응답 수정 폼' : '참석 여부 전달 폼'}
        className="mx-auto grid max-w-sm gap-5 text-left"
      >
        {editingId && (
          <div className="rounded-sm border border-sage bg-sage-soft px-3 py-2 text-[12px] text-sage-strong">
            응답을 수정하고 있어요.{' '}
            <button
              type="button"
              onClick={exitEditMode}
              className="underline underline-offset-2"
            >
              새 응답 추가하기
            </button>
          </div>
        )}

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
            관계 <span className="text-sage-strong">*</span>
          </legend>
          <div
            role="radiogroup"
            aria-label="관계"
            className="mt-2 space-y-3"
          >
            <ChipRow
              title="신랑측"
              values={GROOM_RELATIONSHIPS}
              register={register('relationship')}
            />
            <ChipRow
              title="신부측"
              values={BRIDE_RELATIONSHIPS}
              register={register('relationship')}
            />
          </div>
          {errors.relationship && (
            <p role="alert" className="mt-2 text-xs text-sun">
              {errors.relationship.message}
            </p>
          )}
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
            min={1}
            max={10}
            placeholder="숫자 입력"
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
            전하고 싶은 말 <span className="text-ink-mute/70">(선택)</span>
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
          aria-label={editingId ? '응답 수정 저장' : '참석 여부 전달하기'}
          className="mt-1 rounded-full bg-sage-strong px-6 py-3 font-serif text-sm font-medium tracking-[0.3em] text-paper transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-sage/40"
        >
          {state.status === 'submitting'
            ? '전달 중…'
            : editingId
              ? '수정 저장'
              : '전달하기'}
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

/**
 * A side-label + chip row inside the 관계 fieldset. All chips in the
 * grouped rows share the same `name="relationship"` register binding, so
 * they form a single radio group at the RHF level (only one can be
 * checked across both rows).
 */
function ChipRow({
  title,
  values,
  register,
}: {
  title: string
  values: readonly Relationship[]
  register: UseFormRegisterReturn
}) {
  return (
    <div>
      <p className="mb-1.5 font-display text-[11px] tracking-[0.3em] text-ink-mute uppercase">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <label key={value} className="cursor-pointer">
            <input
              type="radio"
              value={value}
              {...register}
              className="peer sr-only"
            />
            <span className="inline-flex items-center rounded-full border border-line bg-paper px-3 py-1 text-[12px] font-medium tracking-tight text-ink-soft transition hover:bg-sage-soft peer-checked:border-sage-strong peer-checked:bg-sage-strong peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sage-strong">
              {RELATIONSHIP_LABELS[value]}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
