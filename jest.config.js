module.exports = {
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          inlineSourceMap: true,
        },
      },
    ],
  },
  testRegex: '__tests__',
  testPathIgnorePatterns: ['node_modules/', 'dist/'],
  moduleFileExtensions: ['ts', 'js'],
};
