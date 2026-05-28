import { expect, test } from '@playwright/test'

test.describe('Cover section', () => {
  test('shows the formatted wedding date and a labeled scroll indicator', async ({
    page,
  }) => {
    await page.goto('/')
    const cover = page.locator('#cover')
    await expect(cover).toBeVisible()

    await expect(cover.getByRole('heading', { level: 1 })).toContainText('김지수')
    await expect(cover.getByRole('heading', { level: 1 })).toContainText('김난슬')
    await expect(cover.getByText(/2026\.11\.28\s·\s토요일/)).toBeVisible()

    const scroll = page.getByRole('button', { name: '다음 섹션으로 스크롤' })
    await expect(scroll).toBeVisible()
    await scroll.click()
    await expect(page.locator('#greeting')).toBeInViewport()
  })

  test('cover fills the mobile viewport height', async ({ page }) => {
    await page.goto('/')
    const viewport = page.viewportSize()
    if (!viewport) throw new Error('viewport size missing')
    const height = await page.locator('#cover').evaluate((el) => el.clientHeight)
    expect(height).toBeGreaterThanOrEqual(viewport.height - 1)
  })
})
