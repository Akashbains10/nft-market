import { PropertyNFT } from "@/types/property";
import { create } from "zustand";

interface IStore {
  nftProperty: PropertyNFT | null;
  account: string | null;
  isWalletConnected: boolean;
  setAccount: (acc: string | null) => void;
  setNftProperty: (property: PropertyNFT) => void;
  setWalletConnected: (isConnected: boolean) => void;
}

const useNFTStore = create<IStore>((set) => ({
  nftProperty: null,
  account: '',
  isWalletConnected: false,
  setAccount: (acc) => set(() => ({ account: acc })),
  setNftProperty: (property) => set(() => ({ nftProperty: property })),
  setWalletConnected: (isConnected)=> set(()=>({isWalletConnected: isConnected}))
}));

export default useNFTStore;
