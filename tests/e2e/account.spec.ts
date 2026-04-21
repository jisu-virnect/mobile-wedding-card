import { expect, test } from '@playwright/test'

test.describe('Account section', () => {
  test('toggles accordion sides via aria-expanded and copies account number', async ({
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

    const groomBtn = section.getByRole('button', { name: /신랑측/ })
    const brideBtn = section.getByRole('button', { name: /신부측/ })
    await expect(groomBtn).toHaveAttribute('aria-expanded', 'true')
    await expect(brideBtn).toHaveAttribute('aria-expanded', 'false')

    await brideBtn.click()
    await expect(brideBtn).toHaveAttribute('aria-expanded', 'true')

    const brideCopy = section.getByRole('button', {
      name: /신부 김난슬 계좌번호 복사/,
    })
    await brideCopy.click()
    await expect(section.getByRole('status')).toHaveText(
      /신부 김난슬 계좌번호를 복사했어요\./,
    )
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toBe('000-000-000000')
  })
})
