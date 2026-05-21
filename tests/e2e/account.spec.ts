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

    // Both sides' numbers should be visible immediately — no accordion.
    // first() handles the placeholder dupes from parent rows.
    await expect(section.getByText('110-000-000000').first()).toBeVisible()
    await expect(section.getByText('000-000-000000').first()).toBeVisible()

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
