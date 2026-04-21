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

    await expect(when.getByText('2026년 11월 28일 토요일')).toBeVisible()
    await expect(when.getByText('오후 1시')).toBeVisible()

    const highlightedDay = when.getByLabel('2026년 11월 28일 결혼식 날')
    await expect(highlightedDay).toBeVisible()
    await expect(highlightedDay).toHaveText('28')

    await expect(when.getByText(/^D[-+]\d+$|^D-Day$/)).toBeVisible()
  })
})
