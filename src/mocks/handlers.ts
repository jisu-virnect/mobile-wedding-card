import { http, HttpResponse, delay } from 'msw'

export interface RsvpPayload {
  name: string
  side: 'groom' | 'bride'
  attending: boolean
  guests: number
  message?: string
}

export const handlers = [
  http.post('/api/rsvp', async ({ request }) => {
    const body = (await request.json()) as RsvpPayload
    await delay(400)
    if (!body?.name) {
      return HttpResponse.json({ error: 'name is required' }, { status: 400 })
    }
    return HttpResponse.json({ id: crypto.randomUUID(), ...body }, { status: 201 })
  }),
]
