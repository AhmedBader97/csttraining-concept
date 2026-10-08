import { fileURLToPath } from 'node:url';
import nextJest from 'next/jest.js';

// next/jest wires up SWC, CSS/SCSS mocks and next.config, so tests compile like the app.
const createJestConfig = nextJest({ dir: fileURLToPath(new URL('.', import.meta.url)) });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/app/**/{layout,page,not-found}.tsx'],
};

export default createJestConfig(config);
