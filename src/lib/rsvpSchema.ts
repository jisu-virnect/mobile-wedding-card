import { z } from 'zod'

/**
 * Fixed set of relationship chips shown to the guest, grouped by side.
 * Family-only — non-family guests pick whichever side they came on and
 * use the freeform "관계 한 줄" input below to clarify (대학 동기,
 * 회사 동료, etc.).
 */
export const GROOM_RELATIONSHIPS = [
  'groom',
  'groom-father',
  'groom-mother',
] as const

export const BRIDE_RELATIONSHIPS = [
  'bride',
  'bride-father',
  'bride-mother',
  'bride-sibling',
] as const

export const RELATIONSHIPS = [
  ...GROOM_RELATIONSHIPS,
  ...BRIDE_RELATIONSHIPS,
] as const

export type Relationship = (typeof RELATIONSHIPS)[number]

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  groom: '신랑',
  'groom-father': '신랑 아버지',
  'groom-mother': '신랑 어머니',
  bride: '신부',
  'bride-father': '신부 아버지',
  'bride-mother': '신부 어머니',
  'bride-sibling': '신부 동생',
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

// `side` is derived from `relationship` at submit time, not collected
// from the user. `relationshipDetail` is a freeform one-liner that's
// always optional — used by friends / coworkers to specify the
// relationship the chip can't express (대학 동기, 회사 동료 등).
export const rsvpSchema = z.object({
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
    .max(40, '관계 한 줄은 40자 이하로 입력해주세요.')
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
