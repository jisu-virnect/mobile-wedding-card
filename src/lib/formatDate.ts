export interface FormattedWeddingDate {
  date: string
  weekday: string
  combined: string
}

const TIME_ZONE = 'Asia/Seoul'

export function formatWeddingDate(iso: string): FormattedWeddingDate {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${iso}`)
  }

  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  }).formatToParts(d)

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  const date = `${pick('year')}.${pick('month')}.${pick('day')}`
  const weekday = pick('weekday')

  return { date, weekday, combined: `${date} · ${weekday}` }
}

const KOREAN_WEEKDAY = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const

export interface KstYmd {
  year: number
  month: number
  day: number
}

export function kstYmd(iso: string, reference?: Date): KstYmd {
  const d = reference ?? new Date(iso)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${iso}`)
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value)
  return { year: pick('year'), month: pick('month'), day: pick('day') }
}

export function koreanWeekdayOf({ year, month, day }: KstYmd): string {
  return KOREAN_WEEKDAY[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
}

export function formatWeddingLongDate(iso: string): string {
  const ymd = kstYmd(iso)
  return `${ymd.year}년 ${ymd.month}월 ${ymd.day}일 ${koreanWeekdayOf(ymd)}`
}

export function formatWeddingTimeHuman(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${iso}`)
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(d)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''
  const hour = pick('hour')
  const minute = pick('minute')
  const period = pick('dayPeriod').toUpperCase() === 'PM' ? '오후' : '오전'
  return minute === '00'
    ? `${period} ${hour}시`
    : `${period} ${hour}시 ${Number(minute)}분`
}

export function formatWeddingDateTimeHuman(iso: string): string {
  return `${formatWeddingLongDate(iso)} ${formatWeddingTimeHuman(iso)}`
}

export function formatWeddingTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${iso}`)
  }

  // Go through en-US to avoid relying on full-ICU ko-KR data being available
  // on the host runtime (some Node builds fall back to "AM/PM" literals).
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(d)

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  const hour = pick('hour')
  const minute = pick('minute')
  const period = pick('dayPeriod').toUpperCase() === 'PM' ? '오후' : '오전'

  return `${period} ${hour}:${minute}`
}
