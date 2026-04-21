import { expect, test } from '@playwright/test'

test.describe('Share section', () => {
  test('link-copy button writes location.href to the clipboard', async ({
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
    const section = page.locator('#share')
    await section.scrollIntoViewIfNeeded()

    await expect(
      section.getByRole('heading', { level: 2, name: '청첩장 공유하기' }),
    ).toBeVisible()

    const copyBtn = section.getByRole('button', { name: '초대장 링크 복사' })
    await expect(copyBtn).toBeVisible()
    await copyBtn.click()

    await expect(section.getByRole('status')).toHaveText(
      /링크를 복사했어요/,
    )
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toBe(page.url())
  })

  test('native share button is hidden when navigator.share is missing', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        configurable: true,
      })
    })
    await page.goto('/')
    const section = page.locator('#share')
    await section.scrollIntoViewIfNeeded()
    await expect(
      section.getByRole('button', { name: '기기 공유 시트로 공유하기' }),
    ).toHaveCount(0)
  })

  test('native share button invokes navigator.share with location.href when present', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const w = window as unknown as {
        __shareCalls: unknown[]
      }
      w.__shareCalls = []
      Object.defineProperty(navigator, 'share', {
        value: (data: unknown) => {
          w.__shareCalls.push(data)
          return Promise.resolve()
        },
        configurable: true,
      })
    })
    await page.goto('/')
    const section = page.locator('#share')
    await section.scrollIntoViewIfNeeded()
    const btn = section.getByRole('button', {
      name: '기기 공유 시트로 공유하기',
    })
    await expect(btn).toBeVisible()
    await btn.click()
    const calls = await page.evaluate(
      () => (window as unknown as { __shareCalls: unknown[] }).__shareCalls,
    )
    expect(calls).toHaveLength(1)
    expect((calls[0] as { url: string }).url).toBe(page.url())
  })
})
