import { z } from 'zod'

export const rsvpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '이름을 입력해주세요.')
    .max(40, '이름은 40자 이하로 입력해주세요.'),
  side: z.enum(['groom', 'bride']),
  attending: z.enum(['yes', 'no']),
  guests: z
    .number({ error: '동반 인원을 숫자로 입력해주세요.' })
    .int('동반 인원은 정수만 입력 가능합니다.')
    .min(0, '동반 인원은 0 이상이어야 합니다.')
    .max(10, '동반 인원은 최대 10명까지 입력 가능합니다.'),
  message: z.string().trim().max(500, '메시지는 500자 이하로 입력해주세요.'),
})

export type RsvpFormValues = z.infer<typeof rsvpSchema>

export const rsvpDefaults: RsvpFormValues = {
  name: '',
  side: 'groom',
  attending: 'yes',
  guests: 1,
  message: '',
}
