import { expect, test } from '@playwright/test'

test.describe('Where section', () => {
  test('renders venue info, map links, and copies address on click', async ({
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
    const where = page.locator('#where')
    await where.scrollIntoViewIfNeeded()
    await expect(where).toBeVisible()

    await expect(
      where.getByRole('heading', { level: 2, name: '오시는 길' }),
    ).toBeVisible()

    await expect(where.getByText('호텔 라뷔포레')).toBeVisible()
    await expect(
      where.getByText('경기도 수원시 팔달구 권광로134번길 44-11'),
    ).toBeVisible()

    const kakao = where.getByRole('link', { name: '카카오맵으로 열기' })
    await expect(kakao).toBeVisible()
    await expect(kakao).toHaveAttribute(
      'href',
      'https://map.kakao.com/?q=호텔라뷔포레',
    )

    const naver = where.getByRole('link', { name: '네이버지도로 열기' })
    await expect(naver).toHaveAttribute(
      'href',
      'https://map.naver.com/p/search/호텔라뷔포레',
    )

    await where.getByRole('button', { name: '주소 복사' }).click()

    await expect(where.getByRole('status')).toHaveText('주소를 복사했어요.')
    const clipText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipText).toBe('경기도 수원시 팔달구 권광로134번길 44-11')

    await expect(
      where.getByRole('img', { name: '호텔 라뷔포레 약도 이미지' }),
    ).toBeVisible()
  })
})
