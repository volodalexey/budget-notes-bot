const config = require('./jest.config'); // eslint-disable-line @typescript-eslint/no-var-requires
config.testRegex = 'u\\.spec\\.ts$';
console.log('\x1b[36mRUNNING UNIT TESTS\x1b[0m');
module.exports = config;
