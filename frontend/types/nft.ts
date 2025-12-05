import { Log } from "ethers";

export type ListedEvent = Log & {
  args: {
    tokenId: bigint;
    seller: string;
    price: bigint;
  };
};
