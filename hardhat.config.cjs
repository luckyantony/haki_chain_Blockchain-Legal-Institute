require("dotenv/config");
require("@nomicfoundation/hardhat-toolbox");

const {
  ALCHEMY_SEPOLIA_URL,
  ALCHEMY_MAINNET_URL,
  WALLET_PRIVATE_KEY,
  CONSTELLATION_RPC_URL,
} = process.env;

const sharedAccounts =
  WALLET_PRIVATE_KEY && WALLET_PRIVATE_KEY !== ""
    ? [WALLET_PRIVATE_KEY]
    : undefined;

/** @type import("hardhat/config").HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: ALCHEMY_SEPOLIA_URL || "",
      accounts: sharedAccounts,
    },
    mainnet: {
      url: ALCHEMY_MAINNET_URL || "",
      accounts: sharedAccounts,
    },
    constellation: {
      url: CONSTELLATION_RPC_URL || "",
      accounts: sharedAccounts,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

