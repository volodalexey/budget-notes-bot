const config = require('./jest.config'); // eslint-disable-line @typescript-eslint/no-var-requires
config.testRegex = 'i\\.spec\\.ts$';
config.setupFilesAfterEnv = ['./jest.timeout.setup.js'];
console.log('\x1b[36mRUNNING INTEGRATION TESTS\x1b[0m');
module.exports = config;
