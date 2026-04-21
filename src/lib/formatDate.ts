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

export function formatWeddingTime(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}
