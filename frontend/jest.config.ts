import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})
 
// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node', 
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // to test components and UI related codes, should be jsdom
  testEnvironmentOptions: {},
}
const finalConfig = {
  ...config,
  projects: [
    {
      ...config,
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
      testPathIgnorePatterns: [
        '**/*component*.test.{js,jsx,ts,tsx}',
        '**/*form*.test.{js,jsx,ts,tsx}',
        '**/*page*.test.{js,jsx,ts,tsx}',
      ],
    },
    {
      ...config,
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '**/__tests__/**/*component*.test.{js,jsx,ts,tsx}',
        '**/__tests__/**/*form*.test.{js,jsx,ts,tsx}',
        '**/__tests__/**/*page*.test.{js,jsx,ts,tsx}',
      ],
    },
  ],
}
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)