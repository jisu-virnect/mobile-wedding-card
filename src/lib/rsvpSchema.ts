import { z } from 'zod'

// `side` is genuinely optional — many guests (e.g. coworkers, mutual friends)
// don't strictly belong to one side. Making it optional removes friction.
// `attending` stays required but has no default: pre-checking either option
// risks the guest submitting the wrong intent without noticing.
export const rsvpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '이름을 입력해주세요.')
    .max(40, '이름은 40자 이하로 입력해주세요.'),
  side: z.enum(['groom', 'bride']).optional(),
  attending: z.enum(['yes', 'no'], {
    message: '참석 여부를 선택해주세요.',
  }),
  guests: z
    .number({ message: '참석 인원을 숫자로 입력해주세요.' })
    .int('참석 인원은 정수만 입력 가능합니다.')
    .min(0, '참석 인원은 0 이상이어야 합니다.')
    .max(10, '참석 인원은 최대 10명까지 입력 가능합니다.'),
  message: z.string().trim().max(500, '메시지는 500자 이하로 입력해주세요.'),
})

export type RsvpFormValues = z.infer<typeof rsvpSchema>

// Defaults intentionally omit `side` and `attending` so the radio groups
// start unchecked. At runtime react-hook-form treats missing fields as
// undefined; the `as` cast is just a TS pacifier — submit-time zod
// validation enforces that `attending` is picked before sending.
export const rsvpDefaults = {
  name: '',
  guests: 1,
  message: '',
} as RsvpFormValues
