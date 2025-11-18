"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, Check } from "lucide-react";
import useNFTStore from "@/store/useNFTStore";
import { ethers } from "ethers";

export default function WalletButton() {
  
  const [copied, setCopied] = useState(false);
  const { account, walletConnected: isWalletConnected, setAccount, setWalletConnected } =
    useNFTStore();

  // Static mock wallet address for demonstration
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const switchToHardhatNetwork = async (provider: any) => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7A69" }],
      });
    } catch (err) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x7A69",
            chainName: "Hardhat Localhost",
            rpcUrls: ["http://127.0.0.1:8545"],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          },
        ],
      });
    }
  };

  const getMetaMaskProvider = () => {
    if (!window.ethereum) return null;

    const provider = window.ethereum.providers
      ? window.ethereum.providers.find((p) => p.isMetaMask)
      : window.ethereum;

    return provider?.isMetaMask ? provider : null;
  };

  const connectWallet = async () => {
    const metamask = getMetaMaskProvider();
    if (!metamask) return;

    new ethers.BrowserProvider(metamask);

    // check if wallet already connected
    const accounts = await metamask.request({ method: "eth_requestAccounts" });

    if (accounts.length > 0) {
      const userAddress = ethers.getAddress(accounts[0]);
      localStorage.removeItem("walletDisconnected");
      setAccount(userAddress);
      setWalletConnected(true);
    }
    await switchToHardhatNetwork(metamask);
  };

  const disconnectWallet = async () => {
    setAccount(null);
    setWalletConnected(false);
    localStorage.setItem("walletDisconnected", "true");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isWalletConnected && account ? (
          <Button
            variant="outline"
            className="rounded-lg gap-2 font-medium hover:bg-muted/50 active:scale-95 transition-all duration-200"
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">{formatAddress(account)}</span>
            <span className="sm:hidden">Wallet</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={connectWallet}
            className="rounded-lg gap-2 font-medium hover:active:scale-95 transition-all duration-200"
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      {isWalletConnected && account && (
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-semibold">
            Connected Wallet
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-xs text-muted-foreground font-mono cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleCopy(account)}
          >
            <div className="flex items-center justify-between w-full gap-2">
              <span className="truncate">{account}</span>
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={disconnectWallet}
            className="text-muted-foreground gap-2 font-medium hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
