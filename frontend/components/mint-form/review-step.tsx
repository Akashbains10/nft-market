"use client";

import { ChevronRight } from "lucide-react";
import { NFTPreviewCard } from "./nft-preview-card";
import type { FormData } from "./types";

interface ReviewStepProps {
  formData: FormData;
  isMinting: boolean;
  onEditDetails: () => void;
  onEditPricing: () => void;
  onBack: () => void;
  onMint: () => void;
}

export function ReviewStep({
  formData,
  isMinting,
  onEditDetails,
  onEditPricing,
  onBack,
  onMint,
}: ReviewStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <NFTPreviewCard
        mediaPreview={formData.mediaPreview}
        name={formData.name}
        collection={formData.collection}
        description={formData.description}
        attributes={formData.attributes}
        priceETH={formData.priceETH}
        priceUSDC={formData.priceUSDC}
        priceUSDT={formData.priceUSDT}
        royaltyPercentage={formData.royaltyPercentage}
        royaltyRecipient={formData.royaltyRecipient}
        onEditDetails={onEditDetails}
        onEditPricing={onEditPricing}
      />

      <div className="flex gap-4 justify-end">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted hover:border-primary transition-all duration-200 hover:shadow-md"
        >
          Back
        </button>
        <button
          onClick={onMint}
          disabled={isMinting}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isMinting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Minting...
            </>
          ) : (
            <>
              Mint NFT
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
