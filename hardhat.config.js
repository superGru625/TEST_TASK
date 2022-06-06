require('@nomiclabs/hardhat-waffle');
require('@openzeppelin/test-helpers/configure')({
  provider: 'http://localhost:8545',
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: '0.8.12',
};
