export interface PropertyNFT {
  name: string;
  address: string;
  description: string;
  image: string;
  id: string;
  rarity?: string;
  attributes: Attribute[];
}

export interface Attribute {
  trait_type: string;
  value: string | number;
}
