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

  it('submits a serialized payload and shows the success message on 201', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'abc' }),
    } as Response)
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '홍길동')
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

  it('shows a retry-hint message when the fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    const user = userEvent.setup()
    render(<Rsvp />)
    await user.type(screen.getByLabelText(/이름/), '김하늘')
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /참석 여부/ }))
    })
    expect(
      await screen.findByText(/잠시 후 다시 시도해주세요/),
    ).toBeInTheDocument()
  })
})
