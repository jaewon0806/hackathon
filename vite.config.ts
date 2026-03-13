import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/gitlab-api': {
          target: env.VITE_GITLAB_URL || 'https://gitlab.example.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/gitlab-api/, '/api/v4'),
          secure: false,
        },
        '/redmine-api': {
          target: env.VITE_REDMINE_URL || 'https://redmine.example.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/redmine-api/, ''),
          secure: false,
        },
      },
    },
  }
})
