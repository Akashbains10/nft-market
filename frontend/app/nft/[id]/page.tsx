"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import NFTDetailHero from "@/components/nft-detail-hero";
import NFTDetailContent from "@/components/nft-detail-content";
import useNFTStore from "@/store/useNFTStore";
import { PropertyNFT } from "@/types/property";
import toast from "react-hot-toast";
import NFTDetailHeroSkeleton from "@/components/nft-detail-hero-skeleton";
import NFTDetailSkeleton from "@/components/nft-detail-skeleton";

export default function NFTDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { realEstateContract } = useNFTStore();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [nftDetails, setNFTDetails] = useState<PropertyNFT | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNFTdetails = async () => {
      if (!realEstateContract) {
        throw new Error("RealEstate contract is not initialized");
      }
      try {
        setLoading(true);
        const tokenURI = await realEstateContract.tokenURI(id);
        const metadataRes = await fetch(tokenURI);
        const metadata = await metadataRes.json();
        setNFTDetails({id, ...metadata});
      } catch (error: any) {
        const msg =
          error?.response?.data?.error ||
          error?.message ||
          "Failed to upload metadata to IPFS.";
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchNFTdetails();
  }, [id, realEstateContract]);

  if (loading) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="w-20 h-10 bg-muted/50 rounded-lg mb-12 animate-pulse" />
          <div className="grid grid-cols-1 gap-12">
            <div className="space-y-8">
              <NFTDetailHeroSkeleton />
            </div>
            <div className="w-full max-w-3xl mx-auto">
              <NFTDetailSkeleton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!nftDetails) {
    return (
      <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              NFT Not Found
            </h1>
            <p className="text-muted-foreground">
              The NFT you're looking for doesn't exist or has been removed.
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 px-3 py-2 rounded-lg transition-all duration-200 mb-12 group font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back
        </button>

        {/* Main content grid - changed to full-width single column layout */}
        <div className="grid grid-cols-1 gap-12">
          {/* Left column - Image */}
          <div className="space-y-8">
            <NFTDetailHero image={nftDetails.mediaUrl} name={nftDetails.name} />
          </div>

          {/* Right column - All info combined in single view */}
          <div className="w-full max-w-3xl mx-auto">
            <NFTDetailContent
              nft={nftDetails}
              isLiked={isLiked}
              onLikeChange={setIsLiked}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
