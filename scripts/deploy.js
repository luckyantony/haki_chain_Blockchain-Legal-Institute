const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const BountyRegistry = await hre.ethers.getContractFactory("BountyRegistry");
  const registry = await BountyRegistry.deploy();
  await registry.waitForDeployment();
  console.log("BountyRegistry deployed to:", await registry.getAddress());

  const BountyEscrow = await hre.ethers.getContractFactory("BountyEscrow");
  const escrow = await BountyEscrow.deploy(deployer.address);
  await escrow.waitForDeployment();
  console.log("BountyEscrow deployed to:", await escrow.getAddress());

  const HakiToken = await hre.ethers.getContractFactory("HakiToken");
  const token = await HakiToken.deploy(deployer.address);
  await token.waitForDeployment();
  console.log("HakiToken deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

