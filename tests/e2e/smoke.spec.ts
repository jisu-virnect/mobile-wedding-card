import { expect, test } from '@playwright/test'

test('app loads and renders root content', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/청첩장/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
