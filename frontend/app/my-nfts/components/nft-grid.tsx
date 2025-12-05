import { OwnedNFT } from "@/types/property";
import { NFTCard } from "./nft-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { NFTCardSkeleton } from "@/components/dashboard/nft-card-skeleton";

interface NFTGridProps {
  nfts: OwnedNFT[];
  listedIds: number[];
  isLoading: boolean;
  onListClick: (nftId: number, price: string) => void;
  cancelListedNFT: (id: number)=> Promise<void>;
  onSetNftProperty: (nft: OwnedNFT) => void;
}

export function NFTGrid({
  nfts,
  listedIds,
  isLoading,
  onListClick,
  cancelListedNFT,
  onSetNftProperty,
}: NFTGridProps) {
  if (isLoading) {
    return <NFTCardSkeleton />;
  }

  if (nfts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {nfts.map((nft) => {
        const isListed = listedIds.includes(nft?.id);
        return (
          <NFTCard
            key={nft?.id}
            nft={nft}
            isListed={isListed}
            onListClick={onListClick}
            cancelListedNFT={cancelListedNFT}
            onSetNftProperty={onSetNftProperty}
          />
        );
      })}
    </div>
  );
}