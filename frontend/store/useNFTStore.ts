import { PropertyNFT } from "@/types/property";
import { BaseContract, Contract } from "ethers";
import {create} from "zustand";

export interface IRealContract extends BaseContract {
  mintProperty?: (uri: string)=> Promise<any>;
  approve?:(id: string, price: string)=> Promise<any> 
}

type NFTStore = {
  walletConnected: boolean;
  setWalletConnected: (v: boolean) => void;
  account: string | null;
  setAccount: (a: string | null) => void;
  realEstateContract: Contract | null;
  setRealEstateContract: (c: Contract | null) => void;
  realEstateSigner: IRealContract | null;
  setRealEstateSigner: (c: IRealContract | null) => void;
  escrowContract: Contract | null;
  setEscrowContract: (c: Contract | null) => void;
  nftProperty: PropertyNFT | null;
  setNftProperty: (property: PropertyNFT) => void;
};

const useNFTStore = create<NFTStore>((set) => ({
  walletConnected: false,
  setWalletConnected: (v: boolean) => set({ walletConnected: v }),
  account: null,
  setAccount: (a: string | null) => set({ account: a }),
  realEstateContract: null,
  setRealEstateContract: (c: Contract | null) => set({ realEstateContract: c }),
  realEstateSigner: null,
  setRealEstateSigner: (c: IRealContract | null) => set({ realEstateSigner: c }),
  escrowContract: null,
  setEscrowContract: (c: Contract | null) => set({ escrowContract: c }),
  nftProperty: null,
  setNftProperty: (property: PropertyNFT) => set(() => ({ nftProperty: property })),
}));

export default useNFTStore;
