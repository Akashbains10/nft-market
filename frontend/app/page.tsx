"use client";

import { BrowserProvider, ethers } from "ethers";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import NFTGrid from "@/components/nft-grid";
import Footer from "@/components/footer";
import addresses from "@/address.json";
import WalletProvider from "@/components/wallet-provider";

// ABIs
import RealEstate from "@/contracts/RealEstate.json";
import Escrow from "@/contracts/Escrow.json";
import { PropertyNFT } from "@/types/property";
import useNFTStore from "@/store/useNFTStore";

const realEstateAddress = addresses["localhost"].RealEstate;
const escrowAddress = addresses["localhost"].Escrow;

export const getMetaMaskProvider = () => {
  if (!window.ethereum) return null;

  const provider = window.ethereum.providers
    ? window.ethereum.providers.find((p) => p.isMetaMask)
    : window.ethereum;

  return provider?.isMetaMask ? provider : null;
};

export default function Home() {
  // States
  const {
    setWalletConnected,
    setAccount,
    realEstateContract,
    setRealEstateContract,
    setEscrowContract,
  } = useNFTStore();
  const [mounted, setMounted] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [nftProperties, setNftProperties] = useState<PropertyNFT[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Switch to Hardhat Chain
  // const switchToHardhatNetwork = async (provider: any) => {
  //   try {
  //     await provider.request({
  //       method: "wallet_switchEthereumChain",
  //       params: [{ chainId: "0x7A69" }],
  //     });
  //   } catch (err) {
  //     await provider.request({
  //       method: "wallet_addEthereumChain",
  //       params: [
  //         {
  //           chainId: "0x7A69",
  //           chainName: "Hardhat Localhost",
  //           rpcUrls: ["http://127.0.0.1:8545"],
  //           nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  //         },
  //       ],
  //     });
  //   }
  // };

  // Load Contract Instances
  const loadContracts = (signer: any) => {
    const realEstate = new ethers.Contract(
      realEstateAddress,
      RealEstate.abi,
      signer
    );
    const escrow = new ethers.Contract(escrowAddress, Escrow.abi, signer);

    setRealEstateContract(realEstate);
    setEscrowContract(escrow);
  };

  useEffect(() => {
    const autoConnect = async () => {
      // if (localStorage.getItem("walletDisconnected") === "true") return;
      try {
        const metamask = getMetaMaskProvider();
        if (!metamask) return;

        const web3 = new ethers.BrowserProvider(metamask);
        setProvider(web3);

        // check if wallet already connected
        const accounts = await metamask.request({ method: "eth_accounts" });
        console.log("Auto-connected accounts:", accounts);
        if (accounts.length > 0) {
          const userAddress = ethers.getAddress(accounts[0]);
          setAccount(userAddress);
          setWalletConnected(true);
        }

        // await switchToHardhatNetwork(metamask);
        loadContracts(web3);
      } catch (err: any) {
        if (err.code === "ACTION_REJECTED") {
          console.log("Connection request rejected or MetaMask locked.");
        } else {
          console.error("Wallet connection error:", err);
        }
      }
    };

    autoConnect();
  }, []);

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

      // Refresh signer + contracts
      if (provider) {
        const signer = await provider.getSigner();
        loadContracts(signer);
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

  // 🔹 Fetch NFT Properties
  useEffect(() => {
    if (!realEstateContract) return;

    const fetchNFTs = async () => {
      try {
        const properties = [];
        const totalSupply = await realEstateContract.totalSupply();

        for (let i = 1; i <= totalSupply; i++) {
          const nftURI = await realEstateContract.tokenURI(i);
          const res = await fetch(nftURI);
          const metadata = await res.json();
          properties.push(metadata);
        }

        setNftProperties(properties);
      } catch (error) {
        console.error("NFT Fetch Error:", error);
      }
    };

    fetchNFTs();
  }, [realEstateContract]);

  if (!mounted) return null;

  return (
    <WalletProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-20 flex-1">
          <div className="mb-16 space-y-6 max-w-3xl">
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground text-balance leading-tight">
                Discover Premium
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  NFT Assets
                </span>
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-light">
              Explore curated digital collectibles and invest in
              blockchain-verified assets with confidence. Connect your wallet to
              begin trading on the most secure NFT marketplace.
            </p>
          </div>
          <NFTGrid properties={nftProperties} />
        </main>
        <Footer />
      </div>
    </WalletProvider>
  );
}
