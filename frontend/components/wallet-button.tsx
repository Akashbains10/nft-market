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

export default function WalletButton() {
  const [copied, setCopied] = useState(false);
  const { account, isWalletConnected, setAccount, setWalletConnected } =
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

  const connectWallet = () => {};

  const disconnectWallet = () => {
    setAccount(null);
    setWalletConnected(false);
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
