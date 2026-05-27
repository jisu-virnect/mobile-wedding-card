import { useEffect, useMemo, useState } from 'react'
import { fetchAllRsvps, type RsvpRow } from '../lib/rsvp'
import { hasSupabase } from '../lib/supabase'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; rows: RsvpRow[] }
  | { status: 'error'; message: string }

interface Totals {
  attending: number
  notAttending: number
  guestHeadcount: number
  groomCount: number
  brideCount: number
}

function computeTotals(rows: RsvpRow[]): Totals {
  let attending = 0
  let notAttending = 0
  let guestHeadcount = 0
  let groomCount = 0
  let brideCount = 0
  for (const row of rows) {
    if (row.attending) {
      attending += 1
      guestHeadcount += row.guests
    } else {
      notAttending += 1
    }
    if (row.side === 'groom') groomCount += 1
    if (row.side === 'bride') brideCount += 1
  }
  return { attending, notAttending, guestHeadcount, groomCount, brideCount }
}

/** Group rows by device_id — surfaces "this family came in on one phone". */
function groupByDevice(rows: RsvpRow[]): Array<{
  deviceId: string
  rows: RsvpRow[]
}> {
  const map = new Map<string, RsvpRow[]>()
  for (const row of rows) {
    const list = map.get(row.device_id) ?? []
    list.push(row)
    map.set(row.device_id, list)
  }
  return Array.from(map.entries()).map(([deviceId, rs]) => ({
    deviceId,
    rows: rs,
  }))
}

/** Detect same-name collisions for the "동명이인" highlight. */
function nameCollisions(rows: RsvpRow[]): Set<string> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    counts.set(row.name, (counts.get(row.name) ?? 0) + 1)
  }
  const collisions = new Set<string>()
  for (const [name, count] of counts) {
    if (count > 1) collisions.add(name)
  }
  return collisions
}

function downloadCsv(rows: RsvpRow[]) {
  const headers = [
    '이름',
    '소속',
    '관계',
    '참석여부',
    '인원',
    '메시지',
    '제출시각',
    'device_id',
  ]
  const escape = (v: string | number | null): string => {
    if (v == null) return ''
    const s = String(v)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(
      [
        row.name,
        row.side === 'groom' ? '신랑측' : '신부측',
        row.relationship ?? '',
        row.attending ? '참석' : '불참',
        row.guests,
        row.message ?? '',
        row.created_at,
        row.device_id,
      ]
        .map(escape)
        .join(','),
    )
  }
  // Prepend a BOM so Excel opens UTF-8 Korean cleanly.
  const blob = new Blob(['﻿' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const date = new Date().toISOString().slice(0, 10)
  a.download = `rsvp-${date}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function AdminRsvp() {
  const backendReady = hasSupabase()
  const [load, setLoad] = useState<LoadState>(() =>
    backendReady
      ? { status: 'loading' }
      : { status: 'error', message: 'Supabase 가 설정되지 않았어요.' },
  )

  useEffect(() => {
    if (!backendReady) return
    fetchAllRsvps()
      .then((rows) => setLoad({ status: 'ready', rows }))
      .catch((err: Error) => {
        setLoad({ status: 'error', message: err.message })
      })
  }, [backendReady])

  const totals = useMemo<Totals | null>(
    () => (load.status === 'ready' ? computeTotals(load.rows) : null),
    [load],
  )
  const grouped = useMemo(
    () => (load.status === 'ready' ? groupByDevice(load.rows) : []),
    [load],
  )
  const collisions = useMemo(
    () => (load.status === 'ready' ? nameCollisions(load.rows) : new Set()),
    [load],
  )

  return (
    <main className="mx-auto min-h-svh max-w-3xl bg-ivory px-6 py-10">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-2xl text-ink">RSVP 어드민</h1>
        <button
          type="button"
          onClick={() => {
            if (load.status === 'ready') downloadCsv(load.rows)
          }}
          disabled={load.status !== 'ready' || load.rows.length === 0}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-soft transition hover:bg-sage-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          CSV 내보내기
        </button>
      </header>

      {load.status === 'loading' && (
        <p className="text-ink-mute">불러오는 중…</p>
      )}

      {load.status === 'error' && (
        <p className="rounded-sm border border-sun/40 bg-paper px-4 py-3 text-sun">
          {load.message}
        </p>
      )}

      {load.status === 'ready' && totals && (
        <>
          <section
            aria-label="요약"
            className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <SummaryCard label="참석" value={totals.attending} accent />
            <SummaryCard label="불참" value={totals.notAttending} />
            <SummaryCard label="식수 합계" value={totals.guestHeadcount} accent />
            <SummaryCard
              label="신랑측 / 신부측"
              value={`${totals.groomCount} / ${totals.brideCount}`}
            />
          </section>

          {collisions.size > 0 && (
            <p className="mb-4 rounded-sm border border-sun/40 bg-paper px-3 py-2 text-[12px] text-sun">
              ⚠ 동명이인 {collisions.size}건 — 같은 디바이스끼리 그룹핑된 응답을
              확인해 주세요.
            </p>
          )}

          <section aria-label="응답 목록" className="space-y-4">
            {grouped.length === 0 && (
              <p className="text-ink-mute">아직 받은 응답이 없어요.</p>
            )}
            {grouped.map((group) => (
              <article
                key={group.deviceId}
                className="rounded-sm border border-line bg-paper p-3"
              >
                <header className="mb-2 flex items-center justify-between text-[11px] tracking-wide text-ink-mute">
                  <span>디바이스 #{group.deviceId.slice(0, 8)}</span>
                  <span>{group.rows.length}건</span>
                </header>
                <ul className="divide-y divide-line">
                  {group.rows.map((row) => (
                    <li
                      key={row.id}
                      className={
                        'py-2 text-sm ' +
                        (collisions.has(row.name) ? 'bg-sun/5' : '')
                      }
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-ink">
                          <span className="font-serif text-[15px]">
                            {row.name}
                          </span>
                          <span className="ml-2 text-[12px] text-ink-mute">
                            {row.side === 'groom' ? '신랑측' : '신부측'}
                            {row.relationship ? ` · ${row.relationship}` : ''}
                          </span>
                          {collisions.has(row.name) && (
                            <span className="ml-2 rounded-full bg-sun/20 px-1.5 py-0.5 text-[10px] text-sun">
                              동명이인
                            </span>
                          )}
                        </p>
                        <p className="text-[12px] text-ink-soft">
                          {row.attending
                            ? `참석 · ${row.guests}명`
                            : '불참'}
                        </p>
                      </div>
                      {row.message && (
                        <p className="mt-1 text-[12px] leading-relaxed text-ink-mute break-keep">
                          {row.message}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-ink-mute/70">
                        {new Date(row.created_at).toLocaleString('ko-KR')}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  )
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <div
      className={
        'rounded-sm border bg-paper p-3 text-center ' +
        (accent ? 'border-sage' : 'border-line')
      }
    >
      <p className="text-[11px] tracking-wide text-ink-mute">{label}</p>
      <p
        className={
          'mt-1 font-serif text-2xl ' +
          (accent ? 'text-sage-strong' : 'text-ink')
        }
      >
        {value}
      </p>
    </div>
  )
}
