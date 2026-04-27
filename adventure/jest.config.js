/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    // Мокаем React Native и Expo модули которые не нужны в unit-тестах
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^expo.*': '<rootDir>/__mocks__/expo.js',
    '^@react-native.*': '<rootDir>/__mocks__/react-native.js',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  // Игнорируем node_modules кроме zustand (ESM)
  transformIgnorePatterns: [
    'node_modules/(?!(zustand)/)',
  ],
};
