import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';

// This adds support for typescript paths mappings
import 'tsconfig-paths/register';

const config: HardhatUserConfig = {
  solidity: '0.8.9',
};

export default config;
