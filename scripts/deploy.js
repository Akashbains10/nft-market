const fs = require("fs");
const hre = require("hardhat");
const path = require("path");
const { ethers } = hre;

const tokens = (n) => ethers.parseUnits(n.toString(), "ether");

const listings = [
  { id: 1, price: tokens(20) },
  { id: 2, price: tokens(15) },
  { id: 3, price: tokens(10) },
];

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
  // 👥 Setup accounts
  const [seller, buyer] = await ethers.getSigners();
  console.log(`👨‍💼 Seller: ${seller.address}`);
  console.log(`👩‍💼 Buyer: ${buyer.address}`);

  // 🏠 Deploy Real Estate contract
  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.waitForDeployment();
  console.log(`✅ RealEstate deployed at: ${realEstate.target}`);

  // Save RealEstate contract info to frontend
  saveFilesToFrontend("RealEstate", realEstate.target);

  // 🪙 Property metadata URIs
  const propertyURIs = Array.from(
    { length: 3 },
    (_, i) =>
      `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${
        i + 1
      }.json`
  );

  console.log(`\n🏗️ Minting ${propertyURIs.length} properties...`);
  for (const uri of propertyURIs) {
    const tx = await realEstate.connect(seller).mintProperty(uri);
    await tx.wait();
  }

  const total = (await realEstate.totalSupply?.())?.toString() || "unknown";
  console.log(`✅ Total supply after mint: ${total}`);

  // 💼 Deploy Escrow contract
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.target,
    seller.address
  );
  await escrow.waitForDeployment();
  console.log(`✅ Escrow deployed at: ${escrow.target}`);
  
  // Save Escrow contract info to frontend
  saveFilesToFrontend("Escrow", escrow.target);

  // ✅ Approve & List properties dynamically
  console.log(`\n📝 Approving & listing ${listings.length} properties...`);
  for (const { id, price } of listings) {
    // Approve escrow to transfer this property
    const approveTx = await realEstate
      .connect(seller)
      .approve(escrow.target, id);
    await approveTx.wait();

    // List property on escrow
    const listTx = await escrow
      .connect(seller)
      .listProperty(id, buyer.address, price);
    await listTx.wait();

    console.log(
      `✅ Property ${id} listed at price ${ethers.formatEther(price)} ETH`
    );
  }

  console.log(`\n🎉 Deployment & setup finished successfully.`);
}

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exitCode = 1;
});
