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

  const fetchMyProperties = async () => {
    try {
      if (!realEstateContract || !escrowContract || !account) return;
      setIsLoading(true);

      const owned = [];
      const totalSupply = await realEstateContract.totalSupply();
      console.log({ totalSupply });

      const allListings = (await escrowContract.getListedIds()).map(Number);
      const purchasedNFTs = (
        await escrowContract.getPurchasedNfts(account)
      ).map(Number);
      const soldNFTs = (await escrowContract.getSoldNfts(account)).map(Number);
      setListedIds(allListings);

      for (let i = 1; i <= Number(totalSupply); i++) {
        const sellerOfNFT = await escrowContract.sellerOf(i);
        const contractOwner = await realEstateContract.ownerOf(i);
        const isListed = allListings.includes(i);

        if (
          (!isListed && contractOwner.toLowerCase() === account.toLowerCase()) ||
          (isListed && sellerOfNFT.toLowerCase() === account.toLowerCase())
        ) {
          const tokenURI = await realEstateContract.tokenURI(i);
          const metadataRes = await fetch(tokenURI);
          const metadata = await metadataRes.json();

          const isListed = Array.from(allListings).length
            ? Array.from(allListings).find((x) => x === i)
            : false;

          const status = isListed
            ? "listed"
            : purchasedNFTs.includes(i)
            ? "purchased"
            : soldNFTs.includes(i)
            ? "sold"
            : "unlisted";

          owned.push({
            id: i,
            ...metadata,
            status
          });
        }
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

  const listProperty = async (nftId: string, price: string) => {
    if (!escrowContract) {
      toast.error("Failed to list property! Contract is not initialized");
      return;
    }

    try {
      await approveEscrowForListing(nftId);
      const priceWei = ethers.parseEther(price.toString());
      const tx = await escrowContract.listProperty(nftId, priceWei);
      await tx.wait();
      toast.success("Property listed successfully");
    } catch (error) {
      console.log("Error in list property:", error);
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
          onSetNftProperty={setNftProperty}
        />
      </div>
    </main>
  );
}
