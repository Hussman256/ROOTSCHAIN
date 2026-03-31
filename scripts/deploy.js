const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("─────────────────────────────────────────────");
  console.log("Deployer address :", deployer.address);
  console.log(
    "RBTC balance     :",
    hre.ethers.formatEther(balance),
    "RBTC"
  );
  console.log("─────────────────────────────────────────────");

  console.log("\nDeploying SupplyChain...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();

  const address = await supplyChain.getAddress();

  console.log("Contract address :", address);
  console.log(
    "Explorer URL     :",
    `https://rootstock-testnet.blockscout.com/address/${address}`
  );
  console.log("─────────────────────────────────────────────");
  console.log("\nTo verify the contract, run:");
  console.log(
    `  npx hardhat verify --network rskTestnet ${address}`
  );
  console.log("─────────────────────────────────────────────\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
