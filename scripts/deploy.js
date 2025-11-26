const fs = require("fs");
const hre = require("hardhat");
const path = require("path");
const { ethers } = hre;

// make folder in frontend to save contract info it does not exist
// and save the contract address and abi to the frontend

function saveFilesToFrontend(contractName, contractAddress) {
  const contractsDir = path.join(__dirname, "..", "frontend/contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save contract address
  let addresses = {};
  const addressPath = path.join(__dirname, "..", `frontend/address.json`);

  if (fs.existsSync(addressPath)) {
    addresses = JSON.parse(fs.readFileSync(addressPath));
  }

  addresses[hre.network.name] = {
    ...addresses[hre.network.name],
    [contractName]: contractAddress,
  };

  fs.writeFileSync(
    path.join(addressPath),
    JSON.stringify(addresses, undefined, 2)
  );

  // Save contract ABI
  const contractArtifact = artifacts.readArtifactSync(contractName);
  fs.writeFileSync(
    path.join(contractsDir, `${contractName}.json`),
    JSON.stringify(contractArtifact, null, 2)
  );
}

async function main() {
  // Setup accounts
  const [seller, buyer] = await ethers.getSigners();
  console.log(`👨‍💼 Seller: ${seller.address}`);
  console.log(`👩‍💼 Buyer: ${buyer.address}`);

  // Deploy Real Estate contract
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.waitForDeployment();
  console.log(`✅ RealEstate deployed at: ${realEstate.target}`);

  // Save RealEstate contract info to frontend
  saveFilesToFrontend("RealEstate", realEstate.target);

  // Deploy Escrow contract
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.target,
  );
  await escrow.waitForDeployment();
  console.log(`✅ Escrow deployed at: ${escrow.target}`);
  
  // Save Escrow contract info to frontend
  saveFilesToFrontend("Escrow", escrow.target);

  console.log(`\n🎉 Deployment & setup finished successfully.`);
}

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
