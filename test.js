const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow + RealEstate", function () {
  let realEstate, escrow;
  let seller, buyer, random;

  beforeEach(async () => {
    [seller, buyer, random] = await ethers.getSigners();

    // Deploy RealEstate NFT
    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.waitForDeployment();

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await realEstate.getAddress());
    await escrow.waitForDeployment();
  });

  async function mintToSeller() {
  const tx = await realEstate
    .connect(seller)
    .mintProperty("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");

  const receipt = await tx.wait();
  const tokenId = receipt.logs[0].args.tokenId;

  return Number(tokenId);
}


  describe("Listing", function () {
    it("should allow seller to list a property", async () => {
      const tokenId = await mintToSeller();

      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);

      await expect(
        escrow
          .connect(seller)
          .listProperty(tokenId, ethers.parseEther("1"))
      ).to.emit(escrow, "Listed");

      expect(await escrow.isListed(tokenId)).to.equal(true);
      expect(await escrow.purchaseAmount(tokenId)).to.equal(
        ethers.parseEther("1")
      );

      // NFT is moved to escrow
      expect(await realEstate.ownerOf(tokenId)).to.equal(
        await escrow.getAddress()
      );
    });

    it("should revert if listing NFT not owned", async () => {
      const tokenId = await mintToSeller();

      await expect(
        escrow.connect(buyer).listProperty(tokenId, 100)
      ).to.be.revertedWith("Only token owners are allowed to list");
    });
  });

  describe("Earnest Deposit", function () {
    let tokenId;

    beforeEach(async () => {
      tokenId = await mintToSeller();
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow
        .connect(seller)
        .listProperty(tokenId, ethers.parseEther("1"));
    });

    it("should allow correct buyer to deposit earnest", async () => {
      await expect(
        escrow
          .connect(buyer)
          .depositEarnest(tokenId, { value: ethers.parseEther("1") })
      ).to.emit(escrow, "EarnestDeposited");

      expect(await escrow.escrowDeposits(tokenId)).to.equal(
        ethers.parseEther("1")
      );
    });

    it("should revert if deposit amount < purchase amount", async () => {
      await expect(
        escrow
          .connect(buyer)
          .depositEarnest(tokenId, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Insufficient funds deposited");
    });
  });

  describe("Finalizing Sale", function () {
    let tokenId;

    beforeEach(async () => {
      tokenId = await mintToSeller();
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow
        .connect(seller)
        .listProperty(tokenId, ethers.parseEther("1"));

      await escrow
        .connect(buyer)
        .depositEarnest(tokenId, { value: ethers.parseEther("1") });
    });

    it("should allow buyer to finalize sale", async () => {
      await expect(escrow.connect(buyer).finalizeSale(tokenId)).to.emit(
        escrow,
        "Finalized"
      );

      // NFT transferred to buyer
      expect(await realEstate.ownerOf(tokenId)).to.equal(buyer.address);

      // Listing removed
      expect(await escrow.isListed(tokenId)).to.equal(false);
    });

    it("should revert if escrow deposit < price", async () => {
      const tokenId2 = await mintToSeller();

      // seller approves escrow
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId2);

      // list with full price = 2 ETH
      await escrow
        .connect(seller)
        .listProperty(tokenId2, ethers.parseEther("2"));

      // buyer deposits LESS (1 ETH < 2 ETH)
      await expect(
        escrow
        .connect(buyer)
        .depositEarnest(tokenId2, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Insufficient funds deposited");
    });
  });

  describe("Cancel Listing", function () {
    let tokenId;

    beforeEach(async () => {
      tokenId = await mintToSeller();
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow
        .connect(seller)
        .listProperty(tokenId, ethers.parseEther("1"));
    });

    it("should allow seller to cancel without deposit", async () => {
      await expect(escrow.connect(seller).cancelListing(tokenId)).to.emit(
        escrow,
        "ListingCancelled"
      );

      // NFT returned
      expect(await realEstate.ownerOf(tokenId)).to.equal(seller.address);

      expect(await escrow.isListed(tokenId)).to.equal(false);
    });

    it("should refund buyer on cancellation", async () => {
      await escrow
        .connect(buyer)
        .depositEarnest(tokenId, { value: ethers.parseEther("1") });

      const balanceBefore = await ethers.provider.getBalance(buyer.address);

      const tx = await escrow.connect(seller).cancelListing(tokenId);
      await tx.wait();

      const balanceAfter = await ethers.provider.getBalance(buyer.address);

      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("should revert if non-seller tries to cancel", async () => {
      await expect(
        escrow.connect(random).cancelListing(tokenId)
      ).to.be.revertedWith("Only seller is allowed to do this action");
    });
  });

  describe("Enumeration", function () {
    it("should return listedIds correctly", async () => {
      const t1 = await mintToSeller();
      await realEstate.connect(seller).approve(await escrow.getAddress(), t1);
      await escrow.connect(seller).listProperty(t1, 100);

      const ids = await escrow.getListedIds();
      expect(ids.length).to.equal(1);
      expect(ids[0]).to.equal(t1);
    });

    it("getAllListings returns correct parallel arrays", async () => {
      const t1 = await mintToSeller();
      await realEstate.connect(seller).approve(await escrow.getAddress(), t1);
      await escrow.connect(seller).listProperty(t1, 100);

      const [ids, sellers, prices, listed] =
        await escrow.getAllListings();

      expect(ids[0]).to.equal(t1);
      expect(sellers[0]).to.equal(seller.address);
      expect(prices[0]).to.equal(100);
      expect(listed[0]).to.equal(true);
    });
  });
});
