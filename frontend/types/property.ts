export type FilterType = "all" | "listed" | "unlisted" | "sold";

export interface PropertyNFT {
  name: string;
  // address: string;
  collection?: string;
  description: string;
  mediaUrl: string;
  id: string;
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
