import { expect, test } from '@playwright/test'

test.describe('Gallery section', () => {
  test('renders a 3-column thumbnail grid with alt text', async ({ page }) => {
    await page.goto('/')
    const gallery = page.locator('#gallery')
    await gallery.scrollIntoViewIfNeeded()

    const list = gallery.getByRole('list')
    await expect(list).toBeVisible()
    await expect(list).toHaveClass(/grid-cols-3/)

    const thumbs = gallery.getByRole('button', { name: /크게 보기$/ })
    const count = await thumbs.count()
    expect(count).toBeGreaterThanOrEqual(3)

    for (let i = 0; i < count; i++) {
      const img = thumbs.nth(i).locator('img')
      await expect(img).toHaveAttribute('alt', /.+/)
    }
  })

  test('clicking a thumbnail opens the lightbox and arrows navigate', async ({
    page,
  }) => {
    await page.goto('/')
    const gallery = page.locator('#gallery')
    await gallery.scrollIntoViewIfNeeded()

    const thumbs = gallery.getByRole('button', { name: /크게 보기$/ })
    await thumbs.first().click()

    // Lightbox is rendered in a portal; find the yarl container.
    const lightbox = page.locator('.yarl__container')
    await expect(lightbox).toBeVisible()

    const slides = page.locator('.yarl__slide img')
    const firstSrc = await slides.first().getAttribute('src')
    expect(firstSrc).toBeTruthy()

    // Right arrow moves to next slide — yarl updates the current slide's src.
    await page.keyboard.press('ArrowRight')
    await expect
      .poll(async () => {
        const current = page.locator('.yarl__slide_current img')
        return current.getAttribute('src')
      })
      .not.toBe(firstSrc)
  })
})
