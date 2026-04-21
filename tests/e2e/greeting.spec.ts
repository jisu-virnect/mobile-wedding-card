import { expect, test } from '@playwright/test'

test.describe('Greeting section', () => {
  test('renders invitation body and both parent columns', async ({ page }) => {
    await page.goto('/')
    const greeting = page.locator('#greeting')
    await greeting.scrollIntoViewIfNeeded()
    await expect(greeting).toBeVisible()

    await expect(
      greeting.getByRole('heading', { level: 2, name: '초대합니다' }),
    ).toBeVisible()

    await expect(greeting.getByText(/평생을 함께할 것을 약속하는 날/)).toBeVisible()

    const groomSide = greeting.getByRole('group', { name: '신랑측 가족 정보' })
    await expect(groomSide).toContainText('김철수')
    await expect(groomSide).toContainText('김아버지')
    await expect(groomSide).toContainText('김어머니')

    const brideSide = greeting.getByRole('group', { name: '신부측 가족 정보' })
    await expect(brideSide).toContainText('이영희')
    await expect(brideSide).toContainText('이아버지')
    await expect(brideSide).toContainText('이어머니')
  })
})
