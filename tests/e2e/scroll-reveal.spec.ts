import { expect, test } from '@playwright/test'

const SECTION_IDS = [
  'cover',
  'greeting',
  'when',
  'where',
  'gallery',
  'rsvp',
  'account',
  'share',
] as const

test.describe('Section reveal on scroll', () => {
  test('every section becomes fully visible when scrolled into view', async ({
    page,
  }) => {
    await page.goto('/')
    for (const id of SECTION_IDS) {
      const section = page.locator(`#${id}`)
      await section.scrollIntoViewIfNeeded()
      await expect(section).toBeVisible()
      // Opacity should end at 1 once framer-motion settles. Poll a moment so
      // the whileInView transition has time to commit.
      await expect
        .poll(async () =>
          section.evaluate((el) =>
            Number(getComputedStyle(el).opacity),
          ),
        )
        .toBeGreaterThanOrEqual(0.95)
    }
  })

  test('respects prefers-reduced-motion by skipping the staged fade', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    // When reduced-motion is requested, the content is rendered in its
    // animated-end state from the first frame — we assert the Greeting
    // heading renders immediately at opacity 1 before any scroll.
    const heading = page.locator('#greeting').getByRole('heading', {
      level: 2,
      name: '초대합니다',
    })
    await expect(heading).toBeVisible()
    const opacity = await heading.evaluate((el) =>
      Number(getComputedStyle(el).opacity),
    )
    expect(opacity).toBe(1)
  })
})
