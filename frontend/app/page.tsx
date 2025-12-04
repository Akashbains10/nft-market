"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import NFTGrid from "@/components/nft-grid";
import Footer from "@/components/footer";
import { PropertyNFT } from "@/types/property";
import useNFTStore from "@/store/useNFTStore";
import { NFTCardSkeleton } from "@/components/dashboard/nft-card-skeleton";
import { MarketPlaceEmptyState } from "@/components/dashboard/marketplace-empty-state";

export default function Home() {
  const { realEstateContract, escrowContract } = useNFTStore();

  const [listedNFTs, setListedNFTs] = useState<PropertyNFT[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---------------------------
  // Fetch Listed NFTs
  // ---------------------------
  // const fetchListedProperties = async () => {
  //   try {
  //     if (!realEstateContract || !escrowContract) return;

  //     setIsLoading(true);
  //     const listedIds = await escrowContract.getListedIds();
  //     const properties: PropertyNFT[] = [];

  //     for (let id of listedIds) {
  //       id = Number(id);

  //       const tokenURI = await realEstateContract.tokenURI(id);
  //       const metadataRes = await fetch(tokenURI);
  //       const metadata = await metadataRes.json();

  //       properties.push({
  //         id,
  //         ...metadata,
  //         isListed: true
  //       });
  //     }

  //     setListedNFTs(properties);
  //   } catch (err) {
  //     console.error("Marketplace Fetch Error:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchListedProperties = async () => {
    try {
      if (!realEstateContract || !escrowContract) return;

      setIsLoading(true);

      // 1. All listings ever created
      const listedEvents = await escrowContract.queryFilter(
        escrowContract.filters.Listed()
      );

      console.log("Listed Events:", listedEvents);

      // 2. All cancelled listings
      const cancelledEvents = await escrowContract.queryFilter(
        escrowContract.filters.ListingCancelled()
      );

      console.log("Cancelled Events:", cancelledEvents);


      // 3. All sold listings
      const soldEvents = await escrowContract.queryFilter(
        escrowContract.filters.NFTPurchased()
      );

      console.log("Sold Events:", soldEvents);


      // Convert cancelled & sold into sets for fast lookup
      const cancelledSet = new Set(
        cancelledEvents.map((e: any) => e.args.tokenId.toString())
      );
      const soldSet = new Set(soldEvents.map((e: any) => e.args.tokenId.toString()));

      const properties: any[] = [];

      for (let event of listedEvents) {
        const tokenId = Number((event as any).args.tokenId);

        // Skip those that got cancelled later
        if (cancelledSet.has(tokenId.toString())) continue;

        // Skip those that were sold
        if (soldSet.has(tokenId.toString())) continue;

        // 4. Double check that listing is still active on-chain
        const listing = await escrowContract.getListing(tokenId);
        if (!listing.active) continue;

        // 5. Fetch metadata
        const tokenURI = await realEstateContract.tokenURI(tokenId);
        const metadataRes = await fetch(tokenURI);
        const metadata = await metadataRes.json();

        properties.push({
          id: tokenId,
          ...metadata,
          price: Number(listing.price),
          seller: listing.seller,
          isListed: true,
        });
      }

      setListedNFTs(properties);
    } catch (err) {
      console.error("Marketplace Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListedProperties();
  }, [realEstateContract, escrowContract]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-16 md:py-20 flex-1">
        <div className="mb-16 space-y-6 max-w-3xl">
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-balance leading-tight">
              Discover Premium
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NFT Assets
              </span>
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-light">
            Explore curated digital collectibles and invest in
            blockchain-verified assets with confidence. Connect your wallet to
            begin trading on the most secure NFT marketplace.
          </p>
        </div>

        {!loading && listedNFTs.length === 0 ? (
          <MarketPlaceEmptyState />
        ) : loading ? (
          <NFTCardSkeleton />
        ) : (
          <NFTGrid properties={listedNFTs} />
        )}
      </main>

      <Footer />
    </div>
  );
}
