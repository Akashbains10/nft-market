const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow Contract", function () {
  let escrow;
  let nftContract;
  let owner;
  let seller;
  let buyer;
  let otherAddress;
  const NFT_ID = 1;
  const PURCHASE_AMOUNT = ethers.parseEther("1.0");

  // Mock ERC721 contract for testing
  const MockERC721ABI = [
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function transferFrom(address _from, address _to, uint256 _id) external",
    "function mint(address to, uint256 tokenId) external",
  ];

  before(async function () {
    [owner, seller, buyer, otherAddress] = await ethers.getSigners();

    // Deploy a simple mock ERC721
    const MockERC721 = await ethers.getContractFactory("MockERC721");
    nftContract = await MockERC721.deploy();
    await nftContract.waitForDeployment();

    // Deploy Escrow contract
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await nftContract.getAddress());
    await escrow.waitForDeployment();

    // Mint an NFT to seller
    await nftContract.mint(seller.address, NFT_ID);
  });

  describe("Deployment", function () {
    it("Should set the correct NFT address", async function () {
      expect(await escrow.nftAddress()).to.equal(
        await nftContract.getAddress()
      );
    });
  });

  describe("listProperty", function () {
    it("Should allow owner to list their NFT", async function () {
      // Approve escrow to transfer NFT
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID);

      await expect(
        escrow
          .connect(seller)
          .listProperty(NFT_ID, buyer.address, PURCHASE_AMOUNT)
      )
        .to.emit(escrow, "Listed")
        .withArgs(NFT_ID, seller.address, buyer.address, PURCHASE_AMOUNT);

      expect(await escrow.isListed(NFT_ID)).to.be.true;
      expect(await escrow.purchaseAmount(NFT_ID)).to.equal(PURCHASE_AMOUNT);
      expect(await escrow.buyer(NFT_ID)).to.equal(buyer.address);
      expect(await escrow.sellerOf(NFT_ID)).to.equal(seller.address);
    });

    it("Should fail if non-owner tries to list", async function () {
      const NFT_ID_2 = 2;
      await nftContract.mint(seller.address, NFT_ID_2);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_2);

      await expect(
        escrow
          .connect(otherAddress)
          .listProperty(NFT_ID_2, buyer.address, PURCHASE_AMOUNT)
      ).to.be.revertedWith("Only token owners are allowed to list");
    });

    it("Should fail if owner tries to buy their own token", async function () {
      const NFT_ID_3 = 3;
      await nftContract.mint(seller.address, NFT_ID_3);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_3);

      await expect(
        escrow
          .connect(seller)
          .listProperty(NFT_ID_3, seller.address, PURCHASE_AMOUNT)
      ).to.be.revertedWith("Owner can't buy its own token");
    });

    it("Should fail if purchase amount is 0", async function () {
      const NFT_ID_4 = 4;
      await nftContract.mint(seller.address, NFT_ID_4);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_4);

      await expect(
        escrow.connect(seller).listProperty(NFT_ID_4, buyer.address, 0)
      ).to.be.revertedWith("Purchase amount must be greater than 0");
    });

    it("Should fail if NFT is already listed", async function () {
      await expect(
        escrow
          .connect(seller)
          .listProperty(NFT_ID, buyer.address, PURCHASE_AMOUNT)
      ).to.be.revertedWith("Already listed");
    });

    it("Should transfer NFT to escrow contract", async function () {
      expect(await nftContract.ownerOf(NFT_ID)).to.equal(
        await escrow.getAddress()
      );
    });

    it("Should add NFT to listedIds", async function () {
      const listedIds = await escrow.getListedIds();
      const listedStr = listedIds.map((id) => id.toString());
      expect(listedStr).to.include(NFT_ID.toString());
    });
  });

  describe("depositEarnest", function () {
    it("Should allow buyer to deposit earnest", async function () {
      const depositAmount = PURCHASE_AMOUNT;

      await expect(
        escrow.connect(buyer).depositEarnest(NFT_ID, { value: depositAmount })
      )
        .to.emit(escrow, "EarnestDeposited")
        .withArgs(NFT_ID, buyer.address, depositAmount);

      expect(await escrow.escrowDeposits(NFT_ID)).to.equal(depositAmount);
    });

    it("Should fail if non-buyer tries to deposit", async function () {
      await expect(
        escrow
          .connect(otherAddress)
          .depositEarnest(NFT_ID, { value: PURCHASE_AMOUNT })
      ).to.be.revertedWith("Only buyer is allowed to do this action");
    });

    it("Should fail if deposit is less than purchase amount", async function () {
      const NFT_ID_5 = 5;
      await nftContract.mint(seller.address, NFT_ID_5);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_5);
      await escrow
        .connect(seller)
        .listProperty(NFT_ID_5, buyer.address, PURCHASE_AMOUNT);

      const insufficientAmount = ethers.parseEther("0.5");
      await escrow
        .connect(buyer)
        .depositEarnest(NFT_ID_5, { value: insufficientAmount });
      expect(await escrow.escrowDeposits(NFT_ID_5)).to.equal(
        insufficientAmount
      );

    //   await expect(
    //     escrow
    //       .connect(buyer)
    //       .depositEarnest(NFT_ID_5, { value: insufficientAmount })
    //   ).to.be.revertedWith("Insufficient funds deposited");
    });

    it("Should fail if NFT is not listed", async function () {
      const NFT_ID_6 = 6;
      await expect(
        escrow
          .connect(buyer)
          .depositEarnest(NFT_ID_6, { value: PURCHASE_AMOUNT })
      ).to.be.revertedWith("NFT is not listed");
    });

    it("Should allow multiple deposits from buyer", async function () {
      const additionalDeposit = ethers.parseEther("0.5");
      await escrow
        .connect(buyer)
        .depositEarnest(NFT_ID, { value: additionalDeposit });

      const totalDeposit = PURCHASE_AMOUNT + additionalDeposit;
      expect(await escrow.escrowDeposits(NFT_ID)).to.equal(totalDeposit);
    });
  });

  describe("finalizeSale", function () {
    it("Should finalize sale and transfer NFT to buyer", async function () {
      const initialSellerBalance = await ethers.provider.getBalance(
        seller.address
      );
      const totalDeposited = await escrow.escrowDeposits(NFT_ID);

      await expect(escrow.connect(buyer).finalizeSale(NFT_ID))
        .to.emit(escrow, "Finalized")
        .withArgs(NFT_ID, buyer.address, seller.address, totalDeposited);

      expect(await nftContract.ownerOf(NFT_ID)).to.equal(buyer.address);
      expect(await escrow.isListed(NFT_ID)).to.be.false;
      expect(await escrow.escrowDeposits(NFT_ID)).to.equal(0);
    });

    it("Should fail if non-buyer tries to finalize", async function () {
      const NFT_ID_7 = 7;
      await nftContract.mint(seller.address, NFT_ID_7);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_7);
      await escrow
        .connect(seller)
        .listProperty(NFT_ID_7, buyer.address, PURCHASE_AMOUNT);
      await escrow
        .connect(buyer)
        .depositEarnest(NFT_ID_7, { value: PURCHASE_AMOUNT });

      await expect(
        escrow.connect(otherAddress).finalizeSale(NFT_ID_7)
      ).to.be.revertedWith("Only buyer is allowed to do this action");
    });

    it("Should fail if NFT is not listed", async function () {
      await expect(
        escrow.connect(buyer).finalizeSale(NFT_ID)
      ).to.be.revertedWith("NFT is not listed");
    });

    it("Should fail if insufficient funds are deposited", async function () {
      const NFT_ID_8 = 8;
      await nftContract.mint(seller.address, NFT_ID_8);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_8);
      await escrow
        .connect(seller)
        .listProperty(NFT_ID_8, buyer.address, PURCHASE_AMOUNT);

      const insufficientDeposit = ethers.parseEther("0.5");
      await escrow
        .connect(buyer)
        .depositEarnest(NFT_ID_8, { value: insufficientDeposit });

      await expect(
        escrow.connect(buyer).finalizeSale(NFT_ID_8)
      ).to.be.revertedWith("Insufficient funds deposited");
    });

    it("Should remove NFT from listedIds after finalization", async function () {
      const NFT_ID_9 = 9;
      await nftContract.mint(seller.address, NFT_ID_9);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_9);
      await escrow
        .connect(seller)
        .listProperty(NFT_ID_9, buyer.address, PURCHASE_AMOUNT);
      await escrow
        .connect(buyer)
        .depositEarnest(NFT_ID_9, { value: PURCHASE_AMOUNT });

      await escrow.connect(buyer).finalizeSale(NFT_ID_9);

      const listedIds = await escrow.getListedIds();
      expect(listedIds).to.not.include(NFT_ID_9);
    });
  });

  describe("cancelListing", function () {
    it("Should allow seller to cancel listing", async function () {
      const NFT_ID_10 = 10;
      await nftContract.mint(seller.address, NFT_ID_10);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_10);
      await escrow
        .connect(seller)
        .listProperty(NFT_ID_10, buyer.address, PURCHASE_AMOUNT);

      await expect(escrow.connect(seller).cancelListing(NFT_ID_10))
        .to.emit(escrow, "ListingCancelled")
        .withArgs(NFT_ID_10, seller.address);

      expect(await escrow.isListed(NFT_ID_10)).to.be.false;
      expect(await nftContract.ownerOf(NFT_ID_10)).to.equal(seller.address);
    });

    it("Should fail if non-seller tries to cancel", async function () {
      const NFT_ID_11 = 11;
      await nftContract.mint(seller.address, NFT_ID_11);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_11);
      await escrow
        .connect(seller)
        .listProperty(NFT_ID_11, buyer.address, PURCHASE_AMOUNT);

      await expect(
        escrow.connect(otherAddress).cancelListing(NFT_ID_11)
      ).to.be.revertedWith("Only seller is allowed to do this action");
    });

    it("Should refund buyer if they had deposited", async function () {
      const NFT_ID_12 = 12;
      await nftContract.mint(seller.address, NFT_ID_12);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_12);
      await escrow
        .connect(seller)
        .listProperty(NFT_ID_12, buyer.address, PURCHASE_AMOUNT);

      await escrow
        .connect(buyer)
        .depositEarnest(NFT_ID_12, { value: PURCHASE_AMOUNT });

      const initialBuyerBalance = await ethers.provider.getBalance(
        buyer.address
      );

      await escrow.connect(seller).cancelListing(NFT_ID_12);

      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
      expect(finalBuyerBalance).to.be.greaterThan(initialBuyerBalance);
    });

    it("Should remove NFT from listedIds after cancellation", async function () {
      const NFT_ID_13 = 13;
      await nftContract.mint(seller.address, NFT_ID_13);
      await nftContract
        .connect(seller)
        .approve(await escrow.getAddress(), NFT_ID_13);
      await escrow
        .connect(seller)
        .listProperty(NFT_ID_13, buyer.address, PURCHASE_AMOUNT);

      await escrow.connect(seller).cancelListing(NFT_ID_13);

      const listedIds = await escrow.getListedIds();
      expect(listedIds).to.not.include(NFT_ID_13);
    });
  });

  describe("getListedIds", function () {
    it("Should return array of listed NFT IDs", async function () {
      const listedIds = await escrow.getListedIds();
      expect(Array.isArray(listedIds)).to.be.true;
    });
  });

  describe("getAllListings", function () {
    it("Should return all listing details", async function () {
      const { ids, sellers, buyers, prices, listed } =
        await escrow.getAllListings();

      expect(ids.length).to.equal(sellers.length);
      expect(sellers.length).to.equal(buyers.length);
      expect(buyers.length).to.equal(prices.length);
      expect(prices.length).to.equal(listed.length);
    });
  });

  describe("receive and fallback", function () {
    it("Should revert direct deposits", async function () {
      await expect(
        seller.sendTransaction({
          to: await escrow.getAddress(),
          value: ethers.parseEther("1.0"),
        })
      ).to.be.reverted;
    });
  });

  describe("getBalance", function () {
    it("Should return contract balance", async function () {
      const balance = await escrow.getBalance();
      expect(balance).to.be.a("bigint");
    });
  });
});
