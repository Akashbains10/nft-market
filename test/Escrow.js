const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
  const nftId = 0;
  const ipfsUrl = "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS";
  
  let seller, buyer, realEstate, escrow;
  beforeEach(async () => {
    [seller, buyer] = await ethers.getSigners();

    // deploy realestate contract
    const realEstateCompiled = await ethers.getContractFactory("RealEstate");
    realEstate = await realEstateCompiled.deploy();

    // mint property or create its NFT token
    const tx1 = await realEstate.connect(seller).mintProperty(ipfsUrl);
    await tx1.wait();

    const compiledEscrow = await ethers.getContractFactory("Escrow");
    escrow = await compiledEscrow.deploy(
      realEstate.address,
      seller.address
    );

    // approve property and give authorization to escrow contract
    const tx2 = await realEstate.connect(seller).approve(escrow.address, nftId);
    await tx2.wait();

    // list the property
    const tx3 = await escrow
      .connect(seller)
      .listProperty(nftId, buyer.address, tokens(10), tokens(5));
    await tx3.wait();
  });

  describe("Deployment", () => {
    it("Returns NFT address", async () => {
      const nftAddress = await escrow.nftAddress();
      expect(nftAddress).to.be.equal(realEstate.address);
    });

    it("Returns seller address", async () => {
      const sellerAddress = await escrow.seller();
      expect(sellerAddress).to.be.equal(seller.address);
    });
  });

  describe("Listing", () => {
    it("Property is listed", async () => {
      const isListed = await escrow.isListed(nftId);
      expect(isListed).to.be.equal(true);
    });

    it("Returns property buyer", async () => {
      const escrowBuyer = await escrow.buyer(nftId);
      expect(escrowBuyer).to.be.equal(buyer.address);
    });
  });

  describe("Deposit Earnest", () => {
    beforeEach(async () => {
      const transaction = await escrow
        .connect(buyer)
        .depositEarnest(1, { value: tokens(5) });
      await transaction.wait();
    });

    it("Returns the deposit ethers", async () => {
      expect(await escrow.getBalance()).to.be.equal(tokens(5));
    });
  });

  describe("Finalize Sale", () => {
    beforeEach(async () => {
      const transaction = await escrow
        .connect(buyer)
        .depositEarnest(1, { value: tokens(5) });
      await transaction.wait();

      // lender pay the remaining ethers
      await buyer.sendTransaction({ to: escrow.address, value: tokens(5) });

      // finalize the transaction
      const finalTransaction = await escrow.finalizeSale(nftId);
      await finalTransaction.wait();
    });

    it("Contract total ethers", async () => {
      expect(await escrow.getBalance()).to.be.equal(tokens(0));
    });

    it("Ownership of property", async() => {
      expect(await realEstate.ownerOf(nftId)).to.be.equal(buyer.address)
    });
  });
});
