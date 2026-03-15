import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // 테스트 실행 전 데모 모드 dev 서버 자동 시작
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_DEMO_MODE: 'true',
      VITE_GITLAB_URL: 'https://demo.example.com',
      VITE_REDMINE_URL: 'https://demo.example.com',
      VITE_ANTHROPIC_API_KEY: 'demo-key',
      VITE_CLAUDE_MODEL: 'claude-haiku-4-5',
    },
    timeout: 30000,
  },
})
