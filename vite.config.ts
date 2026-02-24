/// <reference types="vitest/config" />
import { resolve } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base:
    process.env.VITE_BASE_PATH ||
    (process.env.NODE_ENV === 'development' ? '/' : '/knit-row-counter/'),
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
      '@comp': resolve(__dirname, './src/components'),
    },
  },
  plugins: [react(), viteSingleFile()],
  define: {
    'process.env': {},
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': 'http://backend:80',
      '/auth': 'http://backend:80',
      '/admin': 'http://backend:80',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'src/tests/**',
        'vite.config.ts',
        'src/vite-env.d.ts',
        'coverage/**',
        'eslint.config.js',
        'scripts/**',
      ],
    },
  },
  build: {
    outDir: 'docs',
  },
})
