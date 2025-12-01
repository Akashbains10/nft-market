"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import addresses from "@/address.json";
import RealEstate from "@/contracts/RealEstate.json";
import Escrow from "@/contracts/Escrow.json";
import useNFTStore from "@/store/useNFTStore";

const realEstateAddress = addresses["localhost"].RealEstate;
const escrowAddress = addresses["localhost"].Escrow;

export const getMetaMaskProvider = () => {
  if (!window.ethereum) return null;

  const provider = window.ethereum.providers
    ? window.ethereum.providers.find((p: any) => p.isMetaMask)
    : window.ethereum;

  return provider?.isMetaMask ? provider : null;
};

export default function ContractWrapper({ children }: { children: React.ReactNode }) {
  const {
    setWalletConnected,
    setAccount,
    setRealEstateContract,
    setRealEstateSigner,
    setEscrowContract,
  } = useNFTStore();

  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---------------------------
  // Load Contract Instances
  // ---------------------------
  const loadContracts = async (provider: BrowserProvider, signer: any) => {
    const readContract = new ethers.Contract(
      realEstateAddress,
      RealEstate.abi,
      provider
    );

    const writeContract = new ethers.Contract(
      realEstateAddress,
      RealEstate.abi,
      signer
    );

    const escrow = new ethers.Contract(escrowAddress, Escrow.abi, signer);

    setRealEstateContract(readContract);
    setRealEstateSigner(writeContract);
    setEscrowContract(escrow);
  };

  // ---------------------------
  // Auto Connect Wallet
  // ---------------------------
  useEffect(() => {
    const autoConnect = async () => {
      try {
        const metamask = getMetaMaskProvider();
        if (!metamask) return;

        const web3 = new ethers.BrowserProvider(metamask);
        setProvider(web3);

        const accounts = await metamask.request({ method: "eth_accounts" });

        if (accounts.length > 0) {
          const userAddress = ethers.getAddress(accounts[0]);
          setAccount(userAddress);
          setWalletConnected(true);
        }

        const signer = await web3.getSigner();
        loadContracts(web3, signer);
      } catch (err: any) {
        if (err.code === "ACTION_REJECTED") {
          console.log("Connection request rejected.");
        } else {
          console.error("Wallet connection error:", err);
        }
      }
    };

    if (typeof window !== "undefined") {
      setTimeout(() => autoConnect(), 500);
    }
  }, []);

  // ---------------------------
  // Wallet Event Listeners
  // ---------------------------
  useEffect(() => {
    const metamask = getMetaMaskProvider();
    if (!metamask) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        setAccount(null);
        setWalletConnected(false);
        return;
      }

      const user = ethers.getAddress(accounts[0]);
      setAccount(user);
      setWalletConnected(true);

      if (provider) {
        const signer = await provider.getSigner();
        loadContracts(provider, signer);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    metamask.on("accountsChanged", handleAccountsChanged);
    metamask.on("chainChanged", handleChainChanged);

    return () => {
      metamask.removeListener("accountsChanged", handleAccountsChanged);
      metamask.removeListener("chainChanged", handleChainChanged);
    };
  }, [provider]);

  if (!mounted) return null;

  return <>{children}</>;
}
