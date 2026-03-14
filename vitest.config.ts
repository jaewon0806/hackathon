import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/utils/**', 'src/store/**', 'src/api/connectionTest.ts'],
      exclude: ['src/test/**'],
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
