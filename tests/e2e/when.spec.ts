import { expect, test } from '@playwright/test'

test.describe('When section', () => {
  test('shows long-form date/time, calendar with highlighted wedding day, and D-day badge', async ({
    page,
  }) => {
    await page.goto('/')
    const when = page.locator('#when')
    await when.scrollIntoViewIfNeeded()
    await expect(when).toBeVisible()

    await expect(
      when.getByRole('heading', { level: 2, name: '예식 일시' }),
    ).toBeVisible()

    await expect(when.getByText('2026년 10월 10일 토요일')).toBeVisible()
    await expect(when.getByText('오전 11시')).toBeVisible()

    const highlightedDay = when.getByLabel('2026년 10월 10일 결혼식 날')
    await expect(highlightedDay).toBeVisible()
    await expect(highlightedDay).toHaveText('10')

    await expect(when.getByText(/^D[-+]\d+$|^D-Day$/)).toBeVisible()
  })
})
