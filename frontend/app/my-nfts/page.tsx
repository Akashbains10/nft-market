"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  TrendingUp,
  List,
  CheckCircle,
  Package,
} from "lucide-react";
import { mockNFTs } from "@/lib/mock-data";
import useNFTStore from "@/store/useNFTStore";
import { FilterType, OwnedNFT } from "@/types/property";
import { NFTCardSkeleton } from "@/components/dashboard/nft-card-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import address from '@/address.json';

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
  const { account, realEstateContract, escrowContract, realEstateSigner } =
    useNFTStore();

  const [myNFTs, setMyNFTs] = useState<OwnedNFT[]>([]);
  const [listedIds, setListedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [listedNFTs, setListedNFTs] = useState<Record<string, boolean>>({
    "1": true,
    "3": true,
  });

  const escrowAddress = address['localhost'].Escrow;

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

  const metrics = {
    total: dashboardNFTs.length,
    active: dashboardNFTs.filter((n) => listedNFTs[n.id]).length,
    sold: dashboardNFTs.filter((n) => n.status === "sold").length,
    value: dashboardNFTs
      .filter((n) => listedNFTs[n.id])
      .reduce((sum, n) => sum + Number.parseFloat(n.price), 0)
      .toFixed(2),
  };

  const fetchMyProperties = async () => {
    try {
      if (!realEstateContract || !escrowContract || !account) return;
      setIsLoading(true);
      const owned = [];
      const totalSupply = await realEstateContract.totalSupply();
      console.log({ totalSupply });

      const allListings = await escrowContract.getListedIds();
      setListedIds(allListings);

      for (let i = 1; i <= Number(totalSupply); i++) {
        const owner = await realEstateContract.ownerOf(i);
        if (owner.toLowerCase() === account.toLowerCase()) {
          const tokenURI = await realEstateContract.tokenURI(i);
          console.log({ owner });
          console.log({ tokenURI });
          const metadataRes = await fetch(tokenURI);
          const metadata = await metadataRes.json();

          const isListed = Array.from(allListings).length
            ? Array.from(allListings).find((x) => x === i)
            : false;

          owned.push({
            id: i,
            ...metadata,
            status: isListed ? "listed" : "unlisted",
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
    debugger;
    if (realEstateSigner && realEstateSigner?.approve) {
      const tx = await realEstateSigner?.approve(escrowAddress, nftId);
      await tx.wait();
    } else {
      toast.error("RealEstate Signer is not initialized");
      return;
    }
  };

  const listProperty = async (nftId: string, price: string) => {
    debugger;
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
      debugger;
      console.log("Error in list property:", error);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, [realEstateContract, escrowContract, account]);

  return (
    <main className="min-h-screen bg-background pt-8 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              Your Portfolio
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage and list your NFT collection
            </p>
          </div>
          <a
            href="/mint"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Plus size={20} />
            Create NFT
          </a>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total NFTs Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200/20 dark:border-blue-800/30 p-6 hover:border-blue-300/40 dark:hover:border-blue-700/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Total NFTs
                </h3>
                <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Package size={20} className="text-blue-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {myNFTs?.length}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                In your collection
              </p>
            </div>
          </div>

          {/* Active Listings Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-200/20 dark:border-teal-800/30 p-6 hover:border-teal-300/40 dark:hover:border-teal-700/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Active Listings
                </h3>
                <div className="p-3 bg-teal-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <List size={20} className="text-teal-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {activeListingCount}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Currently listed
              </p>
            </div>
          </div>

          {/* Sold Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200/20 dark:border-purple-800/30 p-6 hover:border-purple-300/40 dark:hover:border-purple-700/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Sold
                </h3>
                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle size={20} className="text-purple-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {metrics.sold}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Completed sales
              </p>
            </div>
          </div>

          {/* Active Value Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/20 dark:border-emerald-800/30 p-6 hover:border-emerald-300/40 dark:hover:border-emerald-700/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Active Value
                </h3>
                <div className="p-3 bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp size={20} className="text-emerald-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {activeListedValue} ETH
              </p>
              <p className="text-xs text-muted-foreground mt-2">Listed value</p>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <input
              type="text"
              placeholder="Search NFTs by name or collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3">
            {(["all", "listed", "unlisted", "sold"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 capitalize ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border hover:border-primary/50"
                }`}
              >
                {filter === "all"
                  ? "All NFTs"
                  : filter === "listed"
                  ? "Listed"
                  : filter === "unlisted"
                  ? "Unlisted"
                  : "Sold"}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {!isLoading && filteredNFTs.length === 0 && <EmptyState />}

        {isLoading ? (
          <NFTCardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNFTs.map((nft) => {
              const isListed = listedIds.includes(nft?.id);
              return (
                <div
                  key={nft?.id}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden bg-muted">
                    <img
                      src={nft?.mediaUrl || "/placeholder.svg"}
                      alt={nft?.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          nft?.status === "listed"
                            ? "bg-emerald-500/90 text-white"
                            : nft?.status === "sold"
                            ? "bg-purple-500/90 text-white"
                            : "bg-gray-500/90 text-white"
                        }`}
                      >
                        {nft?.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Title and Collection */}
                    <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                      {nft?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {nft?.collection}
                    </p>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Price
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {nft?.priceETH} ETH
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          listProperty(nft?.id, nft?.priceETH as string)
                        }
                        className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        {isListed ? "Cancel Listing" : "List Property"}
                      </button>
                      <button className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 hover:shadow-lg active:scale-95 transition-all duration-200 border border-border">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
