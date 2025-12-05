import { OwnedNFT } from "@/types/property";
import { useRouter } from "next/navigation";

interface NFTCardProps {
  nft: OwnedNFT;
  isListed: boolean;
  onListClick: (nftId: number, price: string) => void;
  cancelListedNFT: (id: number) => Promise<any>;
  onSetNftProperty: (nft: OwnedNFT) => void;
}

export function NFTCard({
  nft,
  isListed,
  onListClick,
  onSetNftProperty,
  cancelListedNFT,
}: NFTCardProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    onSetNftProperty(nft);
    router.push(`/nft/${nft?.id}`);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
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
        <p className="text-sm text-muted-foreground mb-4">{nft?.collection}</p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            <p className="text-sm font-semibold text-foreground">
              {nft?.priceETH} ETH
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              isListed ?
              cancelListedNFT(nft?.id) :
              onListClick(nft?.id, nft?.priceETH as string);
            }}
            className="flex-1 px-4 py-2.5 cursor-pointer bg-primary text-primary-foreground font-medium rounded-lg hover:shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isListed ? "Cancel Listing" : "List Marketplace"}
          </button>
          <button
            className="flex-1 px-4 py-2.5 cursor-pointer bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 hover:shadow-lg active:scale-95 transition-all duration-200 border border-border"
            onClick={handleViewDetails}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
