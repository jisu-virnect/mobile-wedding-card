import { expect, test } from '@playwright/test'

test.describe('Where section', () => {
  test('renders venue info, map links, address copy, and structured transit', async ({
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

    await expect(where.getByText('호텔리츠 컨벤션웨딩')).toBeVisible()
    await expect(
      where.getByText('경기도 수원시 팔달구 권광로134번길 46'),
    ).toBeVisible()

    const kakao = where.getByRole('link', { name: '카카오맵으로 열기' })
    await expect(kakao).toBeVisible()
    await expect(kakao).toHaveAttribute(
      'href',
      'https://map.kakao.com/?q=호텔리츠 컨벤션웨딩',
    )

    const naver = where.getByRole('link', { name: '네이버지도로 열기' })
    await expect(naver).toHaveAttribute(
      'href',
      'https://map.naver.com/p/search/호텔리츠 컨벤션웨딩',
    )

    await where.getByRole('button', { name: '주소 복사' }).click()
    await expect(where.getByRole('status')).toHaveText('주소를 복사했어요.')
    const clipText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipText).toBe('경기도 수원시 팔달구 권광로134번길 46')

    await expect(
      where.getByRole('img', { name: '호텔리츠 컨벤션웨딩 약도 이미지' }),
    ).toBeVisible()

    // Structured transit block (지하철 / 버스 / 주차).
    await expect(
      where.getByText('수인분당선 수원시청역 1번 출구 · 도보 3분'),
    ).toBeVisible()
    await expect(
      where.getByText('수원시청역 1번 출구 (국민연금공단)'),
    ).toBeVisible()
    // Bus route line includes individual numbers joined by middle dots.
    await expect(where.getByText(/51 · 52 · 61/)).toBeVisible()
    await expect(where.getByText(/직행 3002 · 4000 · 7002/)).toBeVisible()
  })
})
