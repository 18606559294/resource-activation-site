export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(deepseek-chat)/)',
  ],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
};
