import { useEffect, useMemo, useState } from 'react'
import { adminDeleteRsvp, fetchAllRsvps, type RsvpRow } from '../lib/rsvp'
import { relationshipLabel } from '../lib/rsvpSchema'
import { hasSupabase } from '../lib/supabase'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; rows: RsvpRow[] }
  | { status: 'error'; message: string }

type Tab = 'all' | 'groom' | 'bride'
type ViewMode = 'by-time' | 'by-attending' | 'by-device'

interface Totals {
  attending: number
  notAttending: number
  guestHeadcount: number
}

function computeTotals(rows: RsvpRow[]): Totals {
  let attending = 0
  let notAttending = 0
  let guestHeadcount = 0
  for (const row of rows) {
    if (row.attending) {
      attending += 1
      guestHeadcount += row.guests
    } else {
      notAttending += 1
    }
  }
  return { attending, notAttending, guestHeadcount }
}

function sideCounts(rows: RsvpRow[]): { groom: number; bride: number } {
  let groom = 0
  let bride = 0
  for (const r of rows) {
    if (r.side === 'groom') groom += 1
    else if (r.side === 'bride') bride += 1
  }
  return { groom, bride }
}

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
        relationshipLabel(row.relationship),
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
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('by-time')

  useEffect(() => {
    if (!backendReady) return
    fetchAllRsvps()
      .then((rows) => setLoad({ status: 'ready', rows }))
      .catch((err: Error) => {
        setLoad({ status: 'error', message: err.message })
      })
  }, [backendReady])

  const handleDelete = async (row: RsvpRow) => {
    const ok = window.confirm(
      `${row.name}님의 응답을 삭제하시겠습니까?\n(${row.side === 'groom' ? '신랑측' : '신부측'}${row.relationship ? ` · ${relationshipLabel(row.relationship)}` : ''})`,
    )
    if (!ok) return
    try {
      await adminDeleteRsvp(row.id)
      setLoad((prev) =>
        prev.status === 'ready'
          ? { status: 'ready', rows: prev.rows.filter((r) => r.id !== row.id) }
          : prev,
      )
    } catch (err) {
      console.error('admin delete failed', err)
      window.alert('삭제에 실패했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  const allRows = useMemo<RsvpRow[]>(
    () => (load.status === 'ready' ? load.rows : []),
    [load],
  )
  const sides = useMemo(() => sideCounts(allRows), [allRows])

  const tabFiltered = useMemo(
    () =>
      allRows.filter((row) => {
        if (tab === 'groom') return row.side === 'groom'
        if (tab === 'bride') return row.side === 'bride'
        return true
      }),
    [allRows, tab],
  )

  const totals = useMemo(() => computeTotals(tabFiltered), [tabFiltered])

  const listFiltered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tabFiltered
    return tabFiltered.filter((row) => {
      const hay =
        row.name.toLowerCase() +
        ' ' +
        (row.relationship ?? '').toLowerCase() +
        ' ' +
        relationshipLabel(row.relationship).toLowerCase() +
        ' ' +
        (row.message ?? '').toLowerCase()
      return hay.includes(q)
    })
  }, [tabFiltered, search])

  const collisions = useMemo(() => nameCollisions(allRows), [allRows])

  return (
    <main className="mx-auto min-h-svh max-w-3xl bg-ivory">
      <nav
        aria-label="응답 분류"
        className="sticky top-0 z-10 border-b border-line bg-ivory/90 backdrop-blur"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 py-3">
          <div role="tablist" className="flex gap-1">
            <TabButton
              active={tab === 'all'}
              onClick={() => setTab('all')}
              label="전체"
              count={allRows.length}
            />
            <TabButton
              active={tab === 'groom'}
              onClick={() => setTab('groom')}
              label="신랑측"
              count={sides.groom}
            />
            <TabButton
              active={tab === 'bride'}
              onClick={() => setTab('bride')}
              label="신부측"
              count={sides.bride}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (load.status === 'ready') downloadCsv(load.rows)
            }}
            disabled={load.status !== 'ready' || load.rows.length === 0}
            className="rounded-full border border-line bg-paper px-3 py-1 text-[12px] font-medium text-ink-soft transition hover:bg-sage-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            CSV
          </button>
        </div>
      </nav>

      <div className="px-6 py-6">
        <div className="mb-5">
          <p className="font-display text-[11px] tracking-[0.4em] text-ink-mute uppercase">
            응답 모아보기
          </p>
          <p className="mt-1 font-serif text-[15px] text-ink-soft">
            지수 · 난슬 <span className="text-ink-mute">· 2026.11.28</span>
          </p>
        </div>

        {load.status === 'loading' && (
          <p className="text-ink-mute">불러오는 중…</p>
        )}

        {load.status === 'error' && (
          <p className="rounded-sm border border-sun/40 bg-paper px-4 py-3 text-sun">
            {load.message}
          </p>
        )}

        {load.status === 'ready' && (
          <>
            <section
              aria-label={`${tabLabel(tab)} 요약`}
              className="mb-6 grid grid-cols-3 gap-3"
            >
              <SummaryCard
                label="참석"
                value={totals.attending}
                tone="attending"
              />
              <SummaryCard
                label="불참"
                value={totals.notAttending}
                tone="absent"
              />
              <SummaryCard
                label="식수 합계"
                value={totals.guestHeadcount}
                tone="neutral-strong"
              />
            </section>

            {collisions.size > 0 && (
              <p className="mb-4 rounded-sm border border-sun/40 bg-paper px-3 py-2 text-[12px] text-sun">
                ⚠ 동명이인 {collisions.size}건 — 같은 디바이스끼리 그룹핑된
                응답을 확인해 주세요.
              </p>
            )}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] tracking-wide text-ink-mute">
                {listFiltered.length}건
                {search && (
                  <>
                    {' · '}
                    <span className="text-ink-soft">"{search}"</span> 검색 결과
                  </>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as ViewMode)}
                  aria-label="보기 방식"
                  className="rounded-full border border-line bg-paper px-3 py-1 text-[12px] text-ink-soft outline-none transition focus:border-sage focus:ring-2 focus:ring-sage-soft"
                >
                  <option value="by-time">시간순 (최신)</option>
                  <option value="by-attending">참석/불참</option>
                  <option value="by-device">디바이스별 (가족)</option>
                </select>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="이름·관계·메시지"
                  aria-label="응답 검색"
                  className="w-48 rounded-full border border-line bg-paper px-3 py-1 text-[12px] text-ink outline-none transition placeholder:text-ink-mute focus:border-sage focus:ring-2 focus:ring-sage-soft"
                />
              </div>
            </div>

            <ResponseList
              rows={listFiltered}
              viewMode={viewMode}
              search={search}
              totalRows={allRows.length}
              collisions={collisions}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
    </main>
  )
}

interface ResponseListProps {
  rows: RsvpRow[]
  viewMode: ViewMode
  search: string
  totalRows: number
  collisions: Set<string>
  onDelete: (row: RsvpRow) => void
}

function ResponseList({
  rows,
  viewMode,
  search,
  totalRows,
  collisions,
  onDelete,
}: ResponseListProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-sm border border-line bg-paper px-4 py-6 text-center text-ink-mute">
        {totalRows === 0
          ? '아직 받은 응답이 없어요.'
          : search
            ? `"${search}" 에 해당하는 응답이 없어요.`
            : '이 분류에 해당하는 응답이 없어요.'}
      </p>
    )
  }

  if (viewMode === 'by-device') {
    const grouped = groupByDevice(rows)
    return (
      <section aria-label="응답 목록" className="space-y-4">
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
                <ResponseRow
                  key={row.id}
                  row={row}
                  collisions={collisions}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </article>
        ))}
      </section>
    )
  }

  if (viewMode === 'by-attending') {
    const attending = rows
      .filter((r) => r.attending)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    const absent = rows
      .filter((r) => !r.attending)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    return (
      <section aria-label="응답 목록" className="space-y-4">
        {attending.length > 0 && (
          <article className="rounded-sm border border-line bg-paper p-3">
            <header className="mb-2 flex items-center justify-between text-[11px] tracking-wide">
              <span className="text-emerald-600">참석</span>
              <span className="text-ink-mute">{attending.length}건</span>
            </header>
            <ul className="divide-y divide-line">
              {attending.map((row) => (
                <ResponseRow
                  key={row.id}
                  row={row}
                  collisions={collisions}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </article>
        )}
        {absent.length > 0 && (
          <article className="rounded-sm border border-line bg-paper p-3">
            <header className="mb-2 flex items-center justify-between text-[11px] tracking-wide">
              <span className="text-rose-600">불참</span>
              <span className="text-ink-mute">{absent.length}건</span>
            </header>
            <ul className="divide-y divide-line">
              {absent.map((row) => (
                <ResponseRow
                  key={row.id}
                  row={row}
                  collisions={collisions}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </article>
        )}
      </section>
    )
  }

  // by-time: flat list, latest first.
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  return (
    <section
      aria-label="응답 목록"
      className="rounded-sm border border-line bg-paper p-3"
    >
      <ul className="divide-y divide-line">
        {sorted.map((row) => (
          <ResponseRow
            key={row.id}
            row={row}
            collisions={collisions}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  )
}

interface ResponseRowProps {
  row: RsvpRow
  collisions: Set<string>
  onDelete: (row: RsvpRow) => void
}

function ResponseRow({ row, collisions, onDelete }: ResponseRowProps) {
  return (
    <li
      className={
        'py-2 text-sm ' + (collisions.has(row.name) ? 'bg-sun/5' : '')
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-ink">
          <span className="font-serif text-[15px]">{row.name}</span>
          <span className="ml-2 text-[12px] text-ink-mute">
            {row.side === 'groom' ? '신랑측' : '신부측'}
            {row.relationship
              ? ` · ${relationshipLabel(row.relationship)}`
              : ''}
          </span>
          {collisions.has(row.name) && (
            <span className="ml-2 rounded-full bg-sun/20 px-1.5 py-0.5 text-[10px] text-sun">
              동명이인
            </span>
          )}
        </p>
        <p
          className={
            'text-[12px] font-medium ' +
            (row.attending ? 'text-emerald-600' : 'text-rose-600')
          }
        >
          {row.attending ? `참석 · ${row.guests}명` : '불참'}
        </p>
      </div>
      {row.message && (
        <p className="mt-1 text-[12px] leading-relaxed text-ink-mute break-keep">
          {row.message}
        </p>
      )}
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="text-[10px] text-ink-mute/70">
          {new Date(row.created_at).toLocaleString('ko-KR')}
        </p>
        <button
          type="button"
          onClick={() => onDelete(row)}
          aria-label={`${row.name} 응답 삭제`}
          className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-sun transition hover:bg-sun/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
        >
          삭제
        </button>
      </div>
    </li>
  )
}

function tabLabel(tab: Tab): string {
  if (tab === 'groom') return '신랑측'
  if (tab === 'bride') return '신부측'
  return '전체'
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        'rounded-full px-3 py-1.5 text-[13px] font-medium tracking-tight transition ' +
        (active
          ? 'bg-sage-strong text-paper'
          : 'text-ink-mute hover:bg-sage-soft hover:text-ink-soft')
      }
    >
      {label}
      <span
        className={
          'ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] tabular-nums ' +
          (active ? 'bg-paper/20 text-paper' : 'bg-line/40 text-ink-mute')
        }
      >
        {count}
      </span>
    </button>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone: 'attending' | 'absent' | 'neutral-strong' | 'neutral'
}) {
  // Mapping kept here so future palette tweaks live in one place.
  const valueColor =
    tone === 'attending'
      ? 'text-emerald-600'
      : tone === 'absent'
        ? 'text-rose-600'
        : tone === 'neutral-strong'
          ? 'text-sage-strong'
          : 'text-ink'
  const borderColor =
    tone === 'attending'
      ? 'border-emerald-200'
      : tone === 'absent'
        ? 'border-rose-200'
        : tone === 'neutral-strong'
          ? 'border-sage'
          : 'border-line'
  return (
    <div
      className={
        'rounded-sm border bg-paper p-3 text-center ' + borderColor
      }
    >
      <p className="text-[11px] tracking-wide text-ink-mute">{label}</p>
      <p className={'mt-1 font-serif text-2xl ' + valueColor}>{value}</p>
    </div>
  )
}
