module.exports = {
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'lib',
      testMatch: ['**/tests/lib/**/*.test.js'],
      // Pure library tests don't need DB setup
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/**/*.test.js'],
      testPathIgnorePatterns: ['tests/lib/'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    },
  ],
};
