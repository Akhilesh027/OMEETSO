/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/dist/__tests__/**/*.test.js"],
  moduleFileExtensions: ["js", "json", "node"],
  verbose: true,
  testTimeout: 10000
};

