module.exports = {
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'lib',
      testMatch: ['**/tests/lib/**/*.test.js'],
      // Pure library tests: no DB setup required
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/**/*.test.js'],
      testPathIgnorePatterns: ['tests/lib/'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    },
  ],
};
