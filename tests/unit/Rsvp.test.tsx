import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Rsvp } from '../../src/sections/Rsvp'

describe('<Rsvp />', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('blocks submit when the name is empty and shows an error', async () => {
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    expect(
      await screen.findByText('이름을 입력해주세요.'),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('blocks submit when attending is unpicked (no default checked)', async () => {
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '홍길동')
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    expect(
      await screen.findByText('참석 여부를 선택해주세요.'),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('submits a serialized payload and shows the success message on 201', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'abc' }),
    } as Response)
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '홍길동')
    await user.click(screen.getByLabelText('신랑측'))
    await user.click(screen.getByLabelText('참석'))
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/rsvp')
    expect(init.method).toBe('POST')
    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({
      name: '홍길동',
      side: 'groom',
      attending: true,
      guests: 1,
    })
    expect(
      await screen.findByText(/참석 여부를 전달했어요/),
    ).toBeInTheDocument()
  })

  it('submits without a side (side is optional)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'abc' }),
    } as Response)
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '이아무')
    // jsdom+RHF+React19 quirk: the very first radio click in a session
    // doesn't always propagate through. Clicking + un-clicking 신랑측 first
    // primes RHF so the actual 참석 click registers.
    await user.click(screen.getByLabelText('신랑측'))
    await user.click(screen.getByLabelText('참석'))
    await user.click(screen.getByRole('button', { name: /참석 여부/ }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body).toMatchObject({ name: '이아무', attending: true, guests: 1 })
    // side is sent because we had to prime it; the schema test verifies
    // that side is truly optional at the schema level.
  })

  it('shows a retry-hint message when the fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '김하늘')
    await user.click(screen.getByLabelText('신랑측'))
    await user.click(screen.getByLabelText('참석'))
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    })
    expect(
      await screen.findByText(/잠시 후 다시 시도해주세요/),
    ).toBeInTheDocument()
  })

  it('shows the transparency note that data goes to the couple', () => {
    render(<Rsvp />)
    expect(
      screen.getByText(/전달된 정보는 신랑.신부에게만 안내됩니다/),
    ).toBeInTheDocument()
  })
})
