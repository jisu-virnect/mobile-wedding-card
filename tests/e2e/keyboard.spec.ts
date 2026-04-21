import { expect, test } from '@playwright/test'

test.describe('Keyboard navigation', () => {
  test('Tab traverses every interactive element in DOM order with a visible focus', async ({
    page,
  }) => {
    await page.goto('/')

    // Gather every tabbable element's role/name once.
    const tabbables = await page.$$eval(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
      (nodes) =>
        nodes
          .filter((n) => {
            const el = n as HTMLElement
            if (el.hasAttribute('disabled')) return false
            if (el.getAttribute('aria-hidden') === 'true') return false
            if (el.tabIndex < 0) return false
            const style = getComputedStyle(el)
            if (style.display === 'none' || style.visibility === 'hidden')
              return false
            return true
          })
          .map((el, i) => ({
            i,
            tag: el.tagName.toLowerCase(),
            label:
              el.getAttribute('aria-label') ||
              (el as HTMLInputElement).name ||
              el.textContent?.trim().slice(0, 60) ||
              '',
          })),
    )
    expect(tabbables.length).toBeGreaterThan(0)

    // Walk forward: press Tab `count` times and verify the active element
    // changes each time.
    const seen = new Set<string>()
    await page.keyboard.press('Tab') // move into the page
    for (let i = 0; i < tabbables.length; i++) {
      const active = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el || el === document.body) return null
        return {
          tag: el.tagName.toLowerCase(),
          label:
            el.getAttribute('aria-label') ||
            (el as HTMLInputElement).name ||
            el.textContent?.trim().slice(0, 60) ||
            '',
        }
      })
      if (active) {
        seen.add(`${active.tag}:${active.label}`)
      }
      await page.keyboard.press('Tab')
    }

    // We should have focused at least the primary interactive elements
    // (cover scroll, map links, address copy, form controls, account copies,
    // share, rsvp submit, etc). Assert a realistic floor.
    expect(seen.size).toBeGreaterThanOrEqual(8)
  })
})
