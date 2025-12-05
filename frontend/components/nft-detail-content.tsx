"use client";

import { useEffect, useState } from "react";
import { Heart, Share2, Copy, Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BuyNFTModal from "./buy-nft-modal";
import { PropertyNFT } from "@/types/property";
import addresses from "@/address.json";
import useNFTStore from "@/store/useNFTStore";
import { ListedEvent } from "@/types/nft";

interface NFTDetailContentProps {
  nft: PropertyNFT;
  isLiked?: boolean;
  onLikeChange?: (liked: boolean) => void;
}

export default function NFTDetailContent({
  nft,
  isLiked = false,
  onLikeChange,
}: NFTDetailContentProps) {
  const realEstateAddress = addresses["localhost"].RealEstate;

  const { account, escrowContract } = useNFTStore();
  const [liked, setLiked] = useState(isLiked);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPurchaseDisabled, setIsPurchaseDisabled] = useState<boolean>(false);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    onLikeChange?.(newLiked);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const rarityColors = {
    legendary: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
    epic: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
    rare: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    common: "bg-gradient-to-r from-gray-400 to-gray-500 text-white",
  };

  useEffect(() => {
    const handlePurchaseBtn = async () => {
      if (!escrowContract || !nft?.id) return;

      try {
        let isDisabled = true;

        const listedEvents = (await escrowContract.queryFilter(
          escrowContract.filters.Listed()
        )) as ListedEvent[];

        const targetEvent = listedEvents.find(
          (e) => Number(e.args.tokenId) === Number(nft.id)
        );

        const sellerOfNFT = targetEvent?.args?.seller;

        if (sellerOfNFT) {
          isDisabled = account?.toLowerCase() === sellerOfNFT.toLowerCase();
        }

        setIsPurchaseDisabled(isDisabled);
      } catch (err) {
        console.error("Error determining purchase button state:", err);
        setIsPurchaseDisabled(true);
      }
    };

    handlePurchaseBtn();
  }, [escrowContract, nft?.id, account]);

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-6">
          {/* Title and metadata section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                  {nft?.name}
                </h1>
              </div>
              <Badge
                variant="default"
                className={`capitalize font-semibold text-sm px-4 py-2 whitespace-nowrap ${
                  rarityColors[nft?.collection as keyof typeof rarityColors]
                }`}
              >
                {nft?.collection ?? "Epic"}
              </Badge>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleLike}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 text-foreground px-4 py-3 rounded-lg transition-all duration-300 active:scale-95 group/btn font-semibold border border-primary/20 hover:border-primary/40"
                aria-label="Like NFT"
              >
                <Heart
                  className={`w-5 h-5 transition-all duration-300 ${
                    liked
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-muted-foreground group-hover/btn:text-red-400"
                  }`}
                />
                <span>{liked ? "Liked" : "Like"}</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 text-foreground px-4 py-3 rounded-lg transition-all duration-300 active:scale-95 group/btn font-semibold border border-primary/20 hover:border-primary/40"
                aria-label="Share NFT"
              >
                <Share2 className="w-5 h-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-background rounded-xl p-8 border border-primary/10 hover:border-primary/20 transition-all duration-300">
            <p className="text-xs text-muted-foreground font-semibold tracking-widest mb-3 uppercase">
              Current Price
            </p>
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-foreground">
                  {/* {extractPrice(nft)} ETH */}
                  {nft?.priceETH}
                  ETH
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            About This NFT
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed text-pretty font-light">
            {nft.description}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Properties</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {nft?.attributes.map((prop, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 rounded-lg p-5 border border-primary/10 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
              >
                <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">
                  {prop?.traitType}
                </p>
                <p className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                  {prop.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ownership information section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Ownership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Creator */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/10 hover:border-primary/20 transition-all duration-300 space-y-3">
              <label className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                Creator
              </label>
              <div className="flex items-center justify-between gap-2">
                <a
                  href="#"
                  className="text-sm font-mono text-primary hover:text-accent transition-colors truncate font-semibold flex items-center gap-1"
                >
                  {/* {nft.creator} */}
                  AKASH BAINS
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
                <button
                  onClick={() => handleCopy(nft?.creator, "creator")}
                  className="p-2 hover:bg-primary/10 rounded transition-colors flex-shrink-0"
                  aria-label="Copy creator address"
                >
                  {copiedField === "creator" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Owner */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/10 hover:border-primary/20 transition-all duration-300 space-y-3">
              <label className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                Current Owner
              </label>
              <div className="flex items-center justify-between gap-2">
                <a
                  href="#"
                  className="text-sm font-mono text-primary hover:text-accent transition-colors truncate font-semibold flex items-center gap-1"
                >
                  {/* {nft.owner} */}
                  BYTECODE TECHNOLOGIES
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
                <button
                  onClick={() => handleCopy(nft?.owner, "owner")}
                  className="p-2 hover:bg-primary/10 rounded transition-colors flex-shrink-0"
                  aria-label="Copy owner address"
                >
                  {copiedField === "owner" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Blockchain Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gradient-to-r from-primary/5 to-accent/5 px-5 py-4 rounded-lg border border-primary/10 hover:border-primary/20 transition-all duration-300">
              <span className="text-sm font-semibold text-muted-foreground">
                Contract Address
              </span>
              <button
                onClick={() => handleCopy(realEstateAddress, "contract")}
                className="flex items-center gap-2 group/copy"
                aria-label="Copy contract address"
              >
                <code className="text-xs font-mono text-primary font-semibold group-hover/copy:text-accent transition-colors">
                  {realEstateAddress.slice(0, 6)}...
                  {realEstateAddress.slice(-4)}
                </code>
                {copiedField === "contract" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center bg-gradient-to-r from-primary/5 to-accent/5 px-5 py-4 rounded-lg border border-primary/10 hover:border-primary/20 transition-all duration-300">
              <span className="text-sm font-semibold text-muted-foreground">
                Token ID
              </span>
              <button
                onClick={() => handleCopy(nft.id?.toString(), "tokenId")}
                className="flex items-center gap-2 group/copy"
                aria-label="Copy token ID"
              >
                <code className="text-xs font-mono text-primary font-semibold group-hover/copy:text-accent transition-colors">
                  #{nft.id}
                </code>
                {copiedField === "tokenId" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center bg-gradient-to-r from-primary/5 to-accent/5 px-5 py-4 rounded-lg border border-primary/10 hover:border-primary/20 transition-all duration-300">
              <span className="text-sm font-semibold text-muted-foreground">
                Blockchain
              </span>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-md border border-primary/20 hover:border-primary/40 transition-all">
                Ethereum
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsBuyModalOpen(true)}
          disabled={isPurchaseDisabled}
          title={isPurchaseDisabled ? `You can't buy your own property` : ""}
          className="w-full bg-gradient-to-r from-primary to-accent hov er:from-primary/90 hover:to-accent/90 active:scale-95 text-primary-foreground px-6 py-4 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:from-primary disabled:hover:to-accent disabled:active:scale-100"
        >
          Purchase NFT
        </button>
      </div>

      <BuyNFTModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        nft={nft}
      />
    </>
  );
}
