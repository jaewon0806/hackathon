import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // e2e/ 디렉토리는 Playwright가 담당 — Vitest에서 제외
    exclude: ['node_modules', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // 핵심 비즈니스 로직 파일만 커버리지 측정
      // (페이지/훅/컴포넌트 렌더링은 E2E로 커버)
      include: [
        'src/utils/**',
        'src/store/**',
        'src/api/**',
        'src/components/dashboard/SummaryDetailPanel.tsx',
        'src/components/chatbot/ChatbotPanel.tsx',
      ],
      exclude: ['src/test/**', 'src/mocks/**', 'src/**/*.d.ts'],
    },
    // import.meta.env 더미 값 (실제 API 키 불필요)
    env: {
      VITE_GITLAB_URL: 'https://gitlab.example.com',
      VITE_REDMINE_URL: 'https://redmine.example.com',
      VITE_ANTHROPIC_API_KEY: 'test-key',
      VITE_CLAUDE_MODEL: 'claude-haiku-4-5',
      VITE_DEMO_MODE: 'false',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
