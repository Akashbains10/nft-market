"use client";

import { useState, useMemo, useEffect } from "react";
import { mockNFTs } from "@/lib/mock-data";
import useNFTStore from "@/store/useNFTStore";
import { FilterType, OwnedNFT } from "@/types/property";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import address from "@/address.json";
import { PortfolioHeader } from "./components/portfolio-header";
import { MetricsSection } from "./components/metrics-section";
import { SearchBar } from "./components/search-bar";
import { FilterPills } from "./components/filter-pills";
import { NFTGrid } from "./components/nft-grid";

interface DashboardNFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  price: string;
  priceUSD: string;
  status: "active" | "inactive" | "sold";
  rarity: string;
}

const dashboardNFTs: DashboardNFT[] = mockNFTs.map((nft) => ({
  ...nft,
  status:
    nft?.id === "1" || nft?.id === "3"
      ? "active"
      : nft?.id === "6"
      ? "sold"
      : "inactive",
}));

export default function DashboardPage() {
  const {
    account,
    realEstateContract,
    escrowContract,
    realEstateSigner,
    setNftProperty,
  } = useNFTStore();

  const [myNFTs, setMyNFTs] = useState<OwnedNFT[]>([]);
  const [listedIds, setListedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const escrowAddress = address["localhost"].Escrow;

  const activeListingCount = useMemo(() => {
    if (!myNFTs?.length || !listedIds?.length) return 0;
    return myNFTs.filter((nft) => listedIds.includes(nft.id)).length;
  }, [myNFTs, listedIds]);

  const activeListedValue = useMemo(() => {
    const set = new Set(listedIds);
    return myNFTs.reduce(
      (acc, nft) => acc + (set.has(nft.id) ? Number(nft.priceETH) : 0),
      0
    );
  }, [myNFTs, listedIds]);

  const filteredNFTs = useMemo(() => {
    let result = myNFTs;

    if (searchQuery) {
      result = result.filter((nft) =>
        nft?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter !== "all") {
      result = result.filter((nft) => nft?.status === activeFilter);
    }

    return result;
  }, [searchQuery, activeFilter, myNFTs]);

  // const fetchMyProperties = async () => {
  //   try {
  //     if (!realEstateContract || !escrowContract || !account) return;

  //     setIsLoading(true);

  //     const owned = [];
  //     const totalSupply = await realEstateContract.totalSupply();
  //     const user = account.toLowerCase();
  //     console.log("Total Supply:", totalSupply);

  //     const listedEvents = await escrowContract.queryFilter(
  //       escrowContract.filters.Listed()
  //     );

  //     const cancelledEvents = await escrowContract.queryFilter(
  //       escrowContract.filters.ListingCancelled()
  //     );

  //     const purchasedEvents = await escrowContract.queryFilter(
  //       escrowContract.filters.NFTPurchased()
  //     );

  //     const soldEvents = await escrowContract.queryFilter(
  //       escrowContract.filters.NFTSold()
  //     );

  //     // const allEvents = [
  //     //   ...listedEvents.map((e) => ({ type: "listed", ...e })),
  //     //   ...cancelledEvents.map((e) => ({ type: "cancelled", ...e })),
  //     // ];

  //     // console.log("All Events:", allEvents);

  //     // Map of tokenId → last list event
  //     const activeListings = new Map();
  //     listedEvents.forEach((e: any) => {
  //       activeListings.set(Number(e.args.tokenId), e.args.seller.toLowerCase());
  //     });

  //     // Remove cancelled listings
  //     cancelledEvents.forEach((e: any) => {
  //       const id = Number(e.args.tokenId);
  //       if (activeListings.has(id)) activeListings.delete(id);
  //     });

  //     // Track purchased NFTs
  //     const purchasedByUser = new Set(
  //       purchasedEvents
  //         .filter((e: any) => e.args.buyer.toLowerCase() === user)
  //         .map((e: any) => Number(e.args.tokenId))
  //     );

  //     // Track sold NFTs
  //     const soldByUser = new Set(
  //       soldEvents
  //         .filter((e: any) => e.args.seller.toLowerCase() === user)
  //         .map((e: any) => Number(e.args.tokenId))
  //     );

  //     const allListingIds = Array.from(activeListings.keys());
  //     setListedIds(allListingIds);

  //     for (let i = 1; i <= Number(totalSupply); i++) {
  //       const id = i;

  //       // owner from NFT contract
  //       const realOwner = (await realEstateContract.ownerOf(id)).toLowerCase();

  //       const isListed = activeListings.has(id);
  //       const listingSeller = activeListings.get(id);

  //       // Condition: include only NFTs that belong to user
  //       const userOwns =
  //         (!isListed && realOwner === user) ||
  //         (isListed && listingSeller === user);

  //       if (!userOwns) continue;

  //       // fetch metadata
  //       const tokenURI = await realEstateContract.tokenURI(id);
  //       const metadataRes = await fetch(tokenURI);
  //       const metadata = await metadataRes.json();

  //       let status = "unlisted";

  //       if (isListed) status = "listed";
  //       else if (purchasedByUser.has(id)) status = "purchased";
  //       else if (soldByUser.has(id)) status = "sold";

  //       owned.push({
  //         id,
  //         ...metadata,
  //         status,
  //       });
  //     }

  //     setMyNFTs(owned);
  //   } catch (err) {
  //     console.error("My NFTs Fetch Error: ", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchMyProperties = async () => {
    try {
      if (!realEstateContract || !escrowContract || !account) return;

      setIsLoading(true);

      const owned = [];
      const totalSupply = await realEstateContract.totalSupply();
      const user = account.toLowerCase();
      console.log("Total Supply:", totalSupply);

      const listedEvents = await escrowContract.queryFilter(
        escrowContract.filters.Listed()
      );

      const cancelledEvents = await escrowContract.queryFilter(
        escrowContract.filters.ListingCancelled()
      );

      const purchasedEvents = await escrowContract.queryFilter(
        escrowContract.filters.NFTPurchased()
      );

      const soldEvents = await escrowContract.queryFilter(
        escrowContract.filters.NFTSold()
      );

      // Map tokenId → seller from last list event (initial)
      const activeListings = new Map();
      listedEvents.forEach((e: any) => {
        activeListings.set(Number(e.args.tokenId), e.args.seller.toLowerCase());
      });

      cancelledEvents.forEach((e: any) => {
        const id = Number(e.args.tokenId);

        if (!activeListings.has(id)) return;

        // Find last list event for this token
        const lastListEvent = listedEvents
          .filter((le: any) => Number(le.args.tokenId) === id)
          .sort((a: any, b: any) => b.blockNumber - a.blockNumber)[0];

        const cancelEvent = e;

        // If the cancel event is newer → listing is cancelled
        if (cancelEvent.blockNumber > lastListEvent.blockNumber) {
          activeListings.delete(id);
        }
      });

      // Track purchased NFTs
      const purchasedByUser = new Set(
        purchasedEvents
          .filter((e: any) => e.args.buyer.toLowerCase() === user)
          .map((e: any) => Number(e.args.tokenId))
      );

      // Track sold NFTs
      const soldByUser = new Set(
        soldEvents
          .filter((e: any) => e.args.seller.toLowerCase() === user)
          .map((e: any) => Number(e.args.tokenId))
      );

      // Update your state
      const allListingIds = Array.from(activeListings.keys());
      setListedIds(allListingIds);

      // Loop through all NFTs
      for (let i = 1; i <= Number(totalSupply); i++) {
        const id = i;

        // owner from NFT contract
        const realOwner = (await realEstateContract.ownerOf(id)).toLowerCase();

        const isListed = activeListings.has(id);
        const listingSeller = activeListings.get(id);

        // Include NFTs that the user owns
        const userOwns =
          (!isListed && realOwner === user) ||
          (isListed && listingSeller === user);

        if (!userOwns) continue;

        // fetch metadata
        const tokenURI = await realEstateContract.tokenURI(id);
        const metadataRes = await fetch(tokenURI);
        const metadata = await metadataRes.json();

        let status = "unlisted";
        if (isListed) status = "listed";
        else if (purchasedByUser.has(id)) status = "purchased";
        else if (soldByUser.has(id)) status = "sold";

        owned.push({
          id,
          ...metadata,
          status,
        });
      }

      setMyNFTs(owned);
    } catch (err) {
      console.error("My NFTs Fetch Error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const approveEscrowForListing = async (nftId: string) => {
    if (realEstateSigner && realEstateSigner?.approve) {
      const tx = await realEstateSigner?.approve(escrowAddress, nftId);
      await tx.wait();
    } else {
      toast.error("RealEstate Signer is not initialized");
      return;
    }
  };

  const listProperty = async (nftId: number, price: string) => {
    if (!escrowContract) {
      toast.error("Failed to list property! Contract is not initialized");
      return;
    }

    try {
      await approveEscrowForListing(nftId?.toString());
      const priceWei = ethers.parseEther(price.toString());
      const tx = await escrowContract.listProperty(nftId, priceWei);
      await tx.wait();
      toast.success("Property listed successfully");
    } catch (error) {
      console.log("Error in list property:", error);
    }
  };

  const cancelListedNFT = async (id: number) => {
    if (!escrowContract) {
      console.log("Escrow contract is not initialized");
      return;
    }
    try {
      const tx = await escrowContract.cancelListing(id);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success("NFT has been cancelled from listing successfully");
      } else {
        toast.error("Transaction failed or reverted");
      }
    } catch (error: any) {
      console.log("Error:", error);
      const msg =
        error?.reason ||
        error?.error?.message ||
        error?.data?.message ||
        error?.message ||
        "Failed to cancel listing";
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, [realEstateContract, escrowContract, account]);

  const soldCount = dashboardNFTs.filter((n) => n.status === "sold").length;

  return (
    <main className="min-h-screen bg-background pt-8 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <PortfolioHeader />

        <MetricsSection
          totalNFTs={myNFTs?.length}
          activeListingCount={activeListingCount}
          soldCount={soldCount}
          activeListedValue={activeListedValue}
        />

        <div className="mb-8 space-y-6">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <FilterPills
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        <NFTGrid
          nfts={filteredNFTs}
          listedIds={listedIds}
          isLoading={isLoading}
          onListClick={listProperty}
          cancelListedNFT={cancelListedNFT}
          onSetNftProperty={setNftProperty}
        />
      </div>
    </main>
  );
}
