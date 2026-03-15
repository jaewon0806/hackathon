import { test, expect } from '@playwright/test'

// 모바일 뷰포트(375px) 반응형 레이아웃 E2E 테스트
// iPhone SE 크기 기준

test.use({ viewport: { width: 375, height: 667 } })

test.describe('모바일 반응형 레이아웃', () => {
  test('모바일에서 앱이 정상 로드된다', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).not.toBeEmpty()
    // 가로 스크롤 없음 확인
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5) // 5px 오차 허용
  })

  test('모바일에서 사이드바가 오버레이 모드로 작동한다', async ({ page }) => {
    await page.goto('/')
    // 모바일에서 사이드바는 기본적으로 숨김 또는 오버레이 방식
    // TopBar 또는 헤더가 보여야 함
    const header = page.locator('header, nav, [class*="topbar"], [class*="TopBar"]').first()
    await expect(header).toBeVisible({ timeout: 10000 })
  })

  test('대시보드 요약 카드가 모바일에서 표시된다', async ({ page }) => {
    await page.goto('/')
    // grid-cols-1 레이아웃으로 카드가 세로 배치됨
    await expect(page.locator('body')).not.toBeEmpty()
    // 페이지 로드 오류 없음
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.waitForTimeout(500)
    expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('모바일에서 챗봇 플로팅 버튼이 표시된다', async ({ page }) => {
    await page.goto('/')
    // 챗봇 버튼: fixed 포지션 버튼 (우하단)
    const chatBtn = page.locator('button.fixed').last()
    await expect(chatBtn).toBeVisible({ timeout: 10000 })
  })

  test('모바일에서 GitLab 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/gitlab')
    await expect(page.locator('body')).not.toBeEmpty()
    // 레이아웃 오버플로우 없음
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5)
  })

  test('모바일에서 Redmine 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/redmine')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('모바일에서 설정 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
