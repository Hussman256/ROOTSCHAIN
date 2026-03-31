require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const ALCHEMY_RPC_URL =
  process.env.ALCHEMY_RPC_URL ||
  "https://public-node.testnet.rsk.co";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    rskTestnet: {
      url: ALCHEMY_RPC_URL,
      chainId: 31,
      gasPrice: 60000000,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      rskTestnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "rskTestnet",
        chainId: 31,
        urls: {
          apiURL: "https://rootstock-testnet.blockscout.com/api",
          browserURL: "https://rootstock-testnet.blockscout.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};
