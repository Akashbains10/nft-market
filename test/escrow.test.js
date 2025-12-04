const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstate + MarketplaceEscrow - Full edge-case test suite", function () {
  let RealEstate, Escrow;
  let realEstate, escrow;
  let owner, seller, buyer, feeRecipient, royaltyRecipient, other;

  const ZERO_ADDRESS = ethers.ZeroAddress;

  beforeEach(async () => {
    [owner, seller, buyer, feeRecipient, royaltyRecipient, other] =
      await ethers.getSigners();

    // Deploy RealEstate
    RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.connect(owner).deploy();
    await realEstate.waitForDeployment();

    // explicit address
    const realEstateAddress = await realEstate.getAddress();

    // Deploy Escrow with nftAddress = realEstate.address
    Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.connect(owner).deploy(realEstateAddress);
    await escrow.waitForDeployment();

    // set feeRecipient and platform fee
    await escrow
      .connect(owner)
      .setFeeRecipient(await feeRecipient.getAddress());
    await escrow.connect(owner).setPlatformFeeBps(250n); // 2.5%
  });

  // helper to get addresses quickly
  const addr = async (signerOrAddress) => {
    if (typeof signerOrAddress === "string") return signerOrAddress;
    return await signerOrAddress.getAddress();
  };

  describe("RealEstate - minting & royalty edge cases", function () {
    it("supports ERC2981 and per-token royalty on mint", async function () {
      // mint with 5% royalty
      await realEstate
        .connect(seller)
        .mintProperty("ipfs://p1", await royaltyRecipient.getAddress(), 500);

      const tokenId = 1;
      expect(await realEstate.ownerOf(tokenId)).to.equal(
        await seller.getAddress()
      );

      // sale price (bigint)
      const salePrice = ethers.parseEther("10");
      const [receiver, royaltyAmount] = await realEstate.royaltyInfo(
        tokenId,
        salePrice
      );

      expect(receiver).to.equal(await royaltyRecipient.getAddress());

      const expectedRoyalty = (salePrice * 500n) / 10000n;
      expect(royaltyAmount).to.equal(expectedRoyalty);
    });

    it("allows zero royalty (recipient provided with 0 bps)", async function () {
      // mint with recipient but zero bps
      await realEstate
        .connect(seller)
        .mintProperty("ipfs://p2", await royaltyRecipient.getAddress(), 0);

      const tokenId = 1;
      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await realEstate.royaltyInfo(
        tokenId,
        salePrice
      );

      // ERC2981 can return recipient (address) with zero amount — accept either receiver==addr or zero amount
      // We assert the amount is zero.
      expect(royaltyAmount).to.equal(0n);
    });

    it("reverts mint when royalty too high (above MAX_ROYALTY_BPS)", async function () {
      await expect(
        realEstate
          .connect(seller)
          .mintProperty("ipfs://p3", await royaltyRecipient.getAddress(), 3000)
      ).to.be.revertedWith("royalty too high");
    });

    it("default royalty applies when per-token royalty absent, and deleteDefaultRoyalty resets it", async function () {
      // owner sets default royalty
      await realEstate
        .connect(owner)
        .setDefaultRoyalty(await royaltyRecipient.getAddress(), 100n); // 1%

      // mint without per-token royalty
      await realEstate
        .connect(seller)
        .mintProperty("ipfs://p4", ZERO_ADDRESS, 0);

      const tokenId = 1;
      const salePrice = ethers.parseEther("2");
      const [receiver, royaltyAmount] = await realEstate.royaltyInfo(
        tokenId,
        salePrice
      );
      expect(receiver).to.equal(await royaltyRecipient.getAddress());
      expect(royaltyAmount).to.equal((salePrice * 100n) / 10000n);

      // delete default
      await realEstate.connect(owner).deleteDefaultRoyalty();
      const [, amountAfter] = await realEstate.royaltyInfo(tokenId, salePrice);
      expect(amountAfter).to.equal(0n);
    });

    it("owner can reset per-token royalty to remove it", async function () {
      // mint with per-token royalty
      await realEstate
        .connect(seller)
        .mintProperty("ipfs://p5", await royaltyRecipient.getAddress(), 300n); // 3%
      const tokenId = 1;

      // owner resets token royalty
      await realEstate.connect(owner).resetTokenRoyalty(tokenId);

      const [receiver, amount] = await realEstate.royaltyInfo(
        tokenId,
        ethers.parseEther("1")
      );
      // After reset, if default not set, amount should be zero.
      expect(amount).to.equal(0n);
    });
  });

  describe("Listing rules & validation", function () {
    const price = ethers.parseEther("5");

    beforeEach(async () => {
      // mint token id 1 to seller
      await realEstate
        .connect(seller)
        .mintProperty(
          "ipfs://home/1",
          await royaltyRecipient.getAddress(),
          200n
        );
    });

    it("requires approval for escrow before listing", async function () {
      const tokenId = 1;
      // no approval -> list should revert because ownerOf(tokenId) will still be seller but transferFrom inside listProperty will revert
      await expect(escrow.connect(seller).listProperty(tokenId, price)).to.be
        .reverted;
    });

    it("rejects listing with price zero", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await expect(
        escrow.connect(seller).listProperty(tokenId, 0n)
      ).to.be.revertedWith("Price should not be zero");
    });

    it("only current owner can list (others cannot)", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);

      // other tries to list
      await expect(
        escrow.connect(other).listProperty(tokenId, price)
      ).to.be.revertedWith("Not token owner");
    });

    it("listing transfers NFT to escrow and sets listing record", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);

      await expect(escrow.connect(seller).listProperty(tokenId, price))
        .to.emit(escrow, "Listed")
        .withArgs(tokenId, await seller.getAddress(), price);

      // owner should now be escrow
      expect(await realEstate.ownerOf(tokenId)).to.equal(
        await escrow.getAddress()
      );

      const listing = await escrow.getListing(tokenId);
      expect(listing.seller).to.equal(await seller.getAddress());
      expect(listing.price).to.equal(price);
      expect(listing.active).to.equal(true);
    });

    it("cannot list same token again after it is in escrow (owner changed)", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      // seller no longer owner, so attempting to list again should fail
      await expect(escrow.connect(seller).listProperty(tokenId, price)).to.be
        .reverted;
    });
  });

  describe("Buying flows & funds distribution", function () {
    const price = ethers.parseEther("5");

    beforeEach(async () => {
      // mint token id 1 to seller
      await realEstate
        .connect(seller)
        .mintProperty(
          "ipfs://home/2",
          await royaltyRecipient.getAddress(),
          200n
        );
    });

    it("cannot buy unlisted token", async function () {
      const tokenId = 1;
      await expect(
        escrow.connect(buyer).buyNow(tokenId, { value: price })
      ).to.be.revertedWith("NFT is not listed");
    });

    it("buyer cannot buy with insufficient funds", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      const small = ethers.parseEther("1");
      await expect(
        escrow.connect(buyer).buyNow(tokenId, { value: small })
      ).to.be.revertedWith("Insufficient Funds");
    });

    it("buyer cannot buy their own listing (if same address)", async function () {
      // scenario: seller lists, seller attempts to buy
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      // seller tries to call buyNow (should either fail by business logic or succeed if contract allows — test expects revert)
      // Our Escrow doesn't currently explicitly block buyer==seller, so check behavior:
      // If contract allows it, this would transfer NFT back to seller and distribute funds; but since seller is buying, msg.value must be >= price.
      // We'll assert it reverts because buying your own listing is generally disallowed — adapt if your contract permits.
      await expect(escrow.connect(seller).buyNow(tokenId, { value: price })).to
        .be.reverted;
    });

    it("successful buyNow pays platform fee, royalty, seller; transfers NFT and refunds overpay", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      // gather pre-balances
      const feeBefore = await ethers.provider.getBalance(
        await feeRecipient.getAddress()
      );
      const royaltyBefore = await ethers.provider.getBalance(
        await royaltyRecipient.getAddress()
      );
      const sellerBefore = await ethers.provider.getBalance(
        await seller.getAddress()
      );

      // compute royalty & platform fee (using NFT contract and escrow state)
      const royaltyInfo = await realEstate.royaltyInfo(tokenId, price);
      const royaltyAmount = royaltyInfo[1];

      const platformFeeBps = await escrow.platformFeeBps();
      const platformFee = (price * platformFeeBps) / 10000n;

      const expectedSellerAmount = price - royaltyAmount - platformFee;

      // buyer buys with an overpay
      const overpay = ethers.parseEther("0.2");
      const buyTx = await escrow
        .connect(buyer)
        .buyNow(tokenId, { value: price + overpay });
      await buyTx.wait();

      // post balances
      const feeAfter = await ethers.provider.getBalance(
        await feeRecipient.getAddress()
      );
      const royaltyAfter = await ethers.provider.getBalance(
        await royaltyRecipient.getAddress()
      );
      const sellerAfter = await ethers.provider.getBalance(
        await seller.getAddress()
      );

      // platform fee received
      expect(feeAfter - feeBefore).to.equal(platformFee);

      // royalty received
      expect(royaltyAfter - royaltyBefore).to.equal(royaltyAmount);

      // seller amount received
      expect(sellerAfter - sellerBefore).to.equal(expectedSellerAmount);

      // NFT now belongs to buyer
      expect(await realEstate.ownerOf(tokenId)).to.equal(
        await buyer.getAddress()
      );

      // listing is cleared/disabled after buy
      const listing = await escrow.getListing(tokenId);
      expect(listing.active).to.equal(false);
      expect(listing.price).to.equal(0n);
    });

    it("overpay refunded to buyer (Refund event emitted)", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      const overpay = ethers.parseEther("0.3");
      const tx = await escrow
        .connect(buyer)
        .buyNow(tokenId, { value: price + overpay });
      const receipt = await tx.wait();

      // Expect Refund event exists in logs
      const events = await escrow.queryFilter("Refund", receipt.blockNumber);
      expect(events.length).to.be.greaterThan(0);
    });
  });

  describe("Cancellation, updates, admin and pausable behaviors", function () {
    const price = ethers.parseEther("5");

    beforeEach(async () => {
      // mint token id 1 to seller
      await realEstate
        .connect(seller)
        .mintProperty(
          "ipfs://home/3",
          await royaltyRecipient.getAddress(),
          200n
        );
    });

    it("only seller can update listing price", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      const newPrice = ethers.parseEther("6");
      await escrow.connect(seller).updateListingPrice(tokenId, newPrice);
      const listing = await escrow.getListing(tokenId);
      expect(listing.price).to.equal(newPrice);

      // other cannot update
      await expect(
        escrow.connect(other).updateListingPrice(tokenId, newPrice)
      ).to.be.revertedWith("only seller");
    });

    it("seller can cancel listing and NFT returned to seller", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      await expect(escrow.connect(seller).cancelListing(tokenId))
        .to.emit(escrow, "ListingCancelled")
        .withArgs(tokenId, await seller.getAddress());

      // owner of token should be seller again
      expect(await realEstate.ownerOf(tokenId)).to.equal(
        await seller.getAddress()
      );

      const listing = await escrow.getListing(tokenId);
      expect(listing.active).to.equal(false);
    });

    it("non-seller cannot cancel", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      await expect(
        escrow.connect(other).cancelListing(tokenId)
      ).to.be.revertedWith("only seller");
    });

    it("owner-only admin functions are restricted", async function () {
      // non-owner cannot set fee recipient or platform fee
      await expect(
        escrow.connect(other).setFeeRecipient(await other.getAddress())
      ).to.be.reverted;
      await expect(escrow.connect(other).setPlatformFeeBps(300n)).to.be
        .reverted;

      // owner can set valid values
      await escrow
        .connect(owner)
        .setFeeRecipient(await feeRecipient.getAddress());
      await escrow.connect(owner).setPlatformFeeBps(1000n);
      expect(await escrow.platformFeeBps()).to.equal(1000n);

      // platform fee upper bound test for owner
      await expect(
        escrow.connect(owner).setPlatformFeeBps(3000n)
      ).to.be.revertedWith("Bps too high");
    });

    it("pausable - owner can pause/unpause and pausing blocks actions", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);

      // owner pauses
      await escrow.connect(owner).pause();

      // while paused, listing should revert
      await expect(escrow.connect(seller).listProperty(tokenId, price)).to.be
        .reverted;

      // owner unpauses
      await escrow.connect(owner).unpause();

      // now listing works
      await escrow.connect(seller).listProperty(tokenId, price);

      // pause again to test buy blocked
      await escrow.connect(owner).pause();
      await expect(escrow.connect(buyer).buyNow(tokenId, { value: price })).to
        .be.reverted;
      await escrow.connect(owner).unpause();
    });

    it("updateNFTAddress restricted to owner and updates address", async function () {
      // non-owner cannot update
      await expect(
        escrow.connect(other).updateNFTAddress(await other.getAddress())
      ).to.be.reverted;

      // owner can update (set it to same address to demonstrate)
      const ra = await realEstate.getAddress();
      await escrow.connect(owner).updateNFTAddress(ra);
      expect(await escrow.nftAddress()).to.equal(ra);
    });
  });

  describe("State reset sanity checks after purchase / cancel", function () {
    const price = ethers.parseEther("5");

    beforeEach(async () => {
      await realEstate
        .connect(seller)
        .mintProperty(
          "ipfs://home/4",
          await royaltyRecipient.getAddress(),
          100n
        );
    });

    it("after buy, listings cleared and token ownership moved", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      await escrow.connect(buyer).buyNow(tokenId, { value: price });

      const listing = await escrow.getListing(tokenId);
      expect(listing.active).to.equal(false);
      expect(listing.price).to.equal(0n);

      // token now owned by buyer
      expect(await realEstate.ownerOf(tokenId)).to.equal(
        await buyer.getAddress()
      );
    });

    it("after cancel, listing cleared and owner is seller", async function () {
      const tokenId = 1;
      await realEstate
        .connect(seller)
        .approve(await escrow.getAddress(), tokenId);
      await escrow.connect(seller).listProperty(tokenId, price);

      await escrow.connect(seller).cancelListing(tokenId);

      const listing = await escrow.getListing(tokenId);
      expect(listing.active).to.equal(false);

      expect(await realEstate.ownerOf(tokenId)).to.equal(
        await seller.getAddress()
      );
    });
  });
});
