import { expect, test } from '@playwright/test'

test.describe('RSVP section', () => {
  test('validates name, submits via /api/rsvp, and shows success message', async ({
    page,
  }) => {
    let received: unknown
    await page.route('**/api/rsvp', async (route) => {
      received = route.request().postDataJSON()
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'rsvp-test' }),
      })
    })

    await page.goto('/')
    const rsvp = page.locator('#rsvp')
    await rsvp.scrollIntoViewIfNeeded()

    // Empty-name submit surfaces an inline error and does not hit the network.
    await rsvp.getByRole('button', { name: /참석 여부/ }).click()
    await expect(rsvp.getByText('이름을 입력해주세요.')).toBeVisible()
    expect(received).toBeUndefined()

    await rsvp.getByLabel(/이름/).fill('홍길동')
    await rsvp.getByLabel('신부측').check()
    await rsvp.getByLabel('불참').check()
    await rsvp.getByLabel(/동반 인원/).fill('2')
    await rsvp.getByLabel(/전하고 싶은 말/).fill('축하드려요')

    await rsvp.getByRole('button', { name: /참석 여부/ }).click()

    await expect(rsvp.getByRole('status')).toHaveText(
      /참석 여부를 전달했어요/,
    )
    expect(received).toMatchObject({
      name: '홍길동',
      side: 'bride',
      attending: false,
      guests: 2,
      message: '축하드려요',
    })
  })

  test('shows a retry-hint when the network fails', async ({ page }) => {
    await page.route('**/api/rsvp', (route) => route.abort('failed'))
    await page.goto('/')
    const rsvp = page.locator('#rsvp')
    await rsvp.scrollIntoViewIfNeeded()
    await rsvp.getByLabel(/이름/).fill('이나라')
    await rsvp.getByRole('button', { name: /참석 여부/ }).click()
    await expect(rsvp.getByRole('status')).toHaveText(
      /잠시 후 다시 시도해주세요/,
    )
  })
})
