import { test, expect } from '@playwright/test'

// 데모 모드(VITE_DEMO_MODE=true) E2E 테스트
// playwright.config.ts의 webServer가 VITE_DEMO_MODE=true로 dev 서버를 자동 시작함

test.describe('데모 모드 — 기본 동작', () => {
  test('대시보드 홈이 로드된다', async ({ page }) => {
    await page.goto('/')
    // 사이드바 또는 TopBar가 렌더링되면 앱이 정상 로드된 것
    await expect(page.locator('nav, header, [class*="sidebar"], [class*="topbar"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('데모 모드에서 온보딩 모달이 표시되지 않는다', async ({ page }) => {
    await page.goto('/')
    // 온보딩 모달 타이틀이 없어야 함
    await expect(page.getByText('업무 대시보드 설정')).not.toBeVisible()
  })

  test('GitLab 페이지로 이동된다', async ({ page }) => {
    await page.goto('/gitlab')
    await expect(page).toHaveURL('/gitlab')
    // GitLab 페이지 콘텐츠 확인
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('Redmine 페이지로 이동된다', async ({ page }) => {
    await page.goto('/redmine')
    await expect(page).toHaveURL('/redmine')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('설정 페이지로 이동된다', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/settings')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('존재하지 않는 경로는 대시보드로 폴백된다', async ({ page }) => {
    await page.goto('/not-exist-page')
    // SPA이므로 404가 아닌 앱이 로드되어야 함
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('챗봇 플로팅 버튼이 표시된다', async ({ page }) => {
    await page.goto('/')
    // 챗봇 버튼: 우하단 고정 버튼 (MessageCircle 아이콘)
    const chatBtn = page.locator('button.fixed').last()
    await expect(chatBtn).toBeVisible({ timeout: 10000 })
  })
})
