import { expect, test } from '@playwright/test'

test.describe('Account section', () => {
  test('shows both sides without an accordion and copies an account number', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Clipboard permissions API is Chromium-specific in Playwright',
    )
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.goto('/')
    const section = page.locator('#account')
    await section.scrollIntoViewIfNeeded()

    // Both sides' account numbers should be visible immediately (no
    // accordion). Asserting on a stable groom + bride pair.
    await expect(section.getByText('110-223-048839')).toBeVisible()
    await expect(section.getByText('3333-30-4385686')).toBeVisible()

    const brideCopy = section.getByRole('button', {
      name: /신부 김난슬 계좌번호 복사/,
    })
    await brideCopy.click()
    await expect(section.getByRole('status')).toHaveText(
      /신부 김난슬 계좌번호를 복사했어요\./,
    )
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toBe('3333-30-4385686')
  })
})
