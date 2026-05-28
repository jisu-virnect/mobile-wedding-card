import { z } from 'zod'

/**
 * Fixed set of relationship chips shown to the guest, grouped by side.
 * The "그 외" slot is split into 신랑측/신부측 variants so we can derive
 * `side` from the relationship alone — no separate "어느 쪽 손님?" field
 * needed on the form.
 */
export const GROOM_RELATIONSHIPS = [
  'groom',
  'groom-father',
  'groom-mother',
  'groom-other',
] as const

export const BRIDE_RELATIONSHIPS = [
  'bride',
  'bride-father',
  'bride-mother',
  'bride-sibling',
  'bride-other',
] as const

export const RELATIONSHIPS = [
  ...GROOM_RELATIONSHIPS,
  ...BRIDE_RELATIONSHIPS,
] as const

export type Relationship = (typeof RELATIONSHIPS)[number]

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  groom: '신랑',
  'groom-father': '신랑아버님',
  'groom-mother': '신랑어머님',
  'groom-other': '신랑측 그 외',
  bride: '신부',
  'bride-father': '신부아버님',
  'bride-mother': '신부어머님',
  'bride-sibling': '신부동생',
  'bride-other': '신부측 그 외',
}

/** Derive `side` from the relationship enum (`groom-*` → groom, etc.). */
export function sideFromRelationship(r: Relationship): 'groom' | 'bride' {
  return r.startsWith('bride') ? 'bride' : 'groom'
}

/**
 * Friendly Korean label for any relationship value. Falls back to the
 * raw value (e.g. legacy free-text rows from the old schema) when not
 * in the enum, so existing DB rows keep rendering.
 */
export function relationshipLabel(value: string | null | undefined): string {
  if (!value) return ''
  if (value in RELATIONSHIP_LABELS) {
    return RELATIONSHIP_LABELS[value as Relationship]
  }
  return value
}

/** True when the chip is one of the two "그 외" buckets. */
export function isOtherRelationship(r: Relationship | undefined): boolean {
  return r === 'groom-other' || r === 'bride-other'
}

// `side` is no longer a separate form field — it's derived from
// `relationship` at submit time. The schema only validates relationship,
// attending, guests, and free-text fields. `relationshipDetail` is
// conditionally required when the chip ends in `-other`.
export const rsvpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, '이름을 입력해주세요.')
      .max(40, '이름은 40자 이하로 입력해주세요.'),
    relationship: z.enum(RELATIONSHIPS, {
      message: '관계를 선택해주세요.',
    }),
    relationshipDetail: z
      .string()
      .trim()
      .max(40, '관계 설명은 40자 이하로 입력해주세요.')
      .optional(),
    attending: z.enum(['yes', 'no'], {
      message: '참석 여부를 선택해주세요.',
    }),
    guests: z
      .number({ message: '참석 인원을 숫자로 입력해주세요.' })
      .int('참석 인원은 정수만 입력 가능합니다.')
      .min(1, '참석 인원은 1명 이상이어야 합니다.')
      .max(10, '참석 인원은 최대 10명까지 입력 가능합니다.'),
    message: z
      .string()
      .trim()
      .max(500, '메시지는 500자 이하로 입력해주세요.'),
  })
  .refine(
    (data) =>
      !isOtherRelationship(data.relationship) ||
      (typeof data.relationshipDetail === 'string' &&
        data.relationshipDetail.trim().length > 0),
    {
      message: '관계를 자세히 알려주세요. (예: 신랑 친구, 회사 동료)',
      path: ['relationshipDetail'],
    },
  )

export type RsvpFormValues = z.infer<typeof rsvpSchema>

// Defaults intentionally omit every radio/chip group AND `guests` so the
// guest must consciously fill each one. `guests: 1` was pre-filling and
// causing accidental submissions with a stale headcount. The `as` cast
// is a TS pacifier — runtime zod validation forces the user to fill in
// the missing fields before submit.
export const rsvpDefaults = {
  name: '',
  relationshipDetail: '',
  message: '',
} as RsvpFormValues
