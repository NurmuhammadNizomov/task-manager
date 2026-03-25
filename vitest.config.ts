import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, './')
    }
  },
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node'
        }
      },
      {
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          globalSetup: './tests/setup/global-setup.ts',
          setupFiles: ['./tests/setup/integration-setup.ts'],
          testTimeout: 30000,
          hookTimeout: 30000,
          singleFork: true
        }
      }
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['server/utils/**/*.ts', 'app/composables/**/*.ts']
    }
  }
})
