export type FilterType = "all" | "listed" | "unlisted" | "sold" | "purchased";

export interface PropertyNFT {
  name: string;
  // address: string;
  collection?: string;
  description: string;
  mediaUrl: string;
  id: number;
  attributes: Attribute[];
  priceETH?: string;
}

export interface OwnedNFT extends PropertyNFT {
  status: FilterType
}

export interface Attribute {
  id?: string;
  traitType: string;
  value: string | number;
}
