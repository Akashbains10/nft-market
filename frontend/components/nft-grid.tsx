"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { PropertyNFT } from "@/types/property";
import useNFTStore from "@/store/useNFTStore";

export const extractPrice = (nft: PropertyNFT) =>  nft?.attributes?.find(i=> i?.trait_type === "Purchase Price")?.value;

export default function NFTGrid({
  properties,
}: {
  properties?: PropertyNFT[];
}) {
  const { setNftProperty } = useNFTStore();
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    const newLiked = new Set(liked);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLiked(newLiked);
  };


  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((nft, idx) => {
          console.log("Nft", nft)
          return (
            <Link
              key={idx}
              href={`/nft/${nft?.id}`}
              onClick={() => setNftProperty(nft)}
            >
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 cursor-pointer group border-border/50 hover:bg-card/60 dark:hover:bg-card/40">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Image Container with enhanced overlay */}
                  <div className="relative h-72 bg-gradient-to-br from-primary/10 via-accent/5 to-background overflow-hidden">
                    <img
                      src={nft?.mediaUrl || "/placeholder.svg"}
                      alt={nft?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleLike(nft?.id);
                      }}
                      className="absolute top-4 right-4 bg-background/70 backdrop-blur-md p-2.5 rounded-xl hover:bg-background/90 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${
                          liked.has(nft?.id)
                            ? "fill-red-500 text-red-500 scale-110"
                            : "text-muted-foreground hover:text-red-400"
                        }`}
                      />
                    </button>

                    <Badge
                      className="absolute bottom-4 left-4 capitalize bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 shadow-md font-medium text-xs"
                      variant={
                        nft?.collection === "premium"
                          ? "default"
                          : nft?.collection === "epic"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {nft?.collection}
                    </Badge>
                  </div>

                  {/* Content with improved spacing */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {nft?.name}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-end justify-between group-hover:translate-y-0 transition-transform">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">
                            Current Price
                          </p>
                          <p className="text-xl md:text-2xl font-bold text-primary">
                            {nft?.priceETH}
                            <span className="text-xs text-muted-foreground ml-1 font-normal">
                              ETH
                            </span>
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>

                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="w-full bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 h-9"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
