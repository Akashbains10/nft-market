"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { PropertyNFT } from "@/types/property";
import { extractPrice } from "./nft-grid";
import useNFTStore from "@/store/useNFTStore";
import { Contract, ethers, Signer } from "ethers";
import addresses from "@/address.json";
import Escrow from "@/contracts/Escrow.json";
import { get } from "http";
import { getMetaMaskProvider } from "@/app/page";

interface BuyModalProps {
  nft: PropertyNFT;
  isOpen: boolean;
  onClose: () => void;
}

const escrowAddress = addresses["localhost"].Escrow;

export default function BuyModal({ nft, isOpen, onClose }: BuyModalProps) {
  const [step, setStep] = useState<
    "confirm" | "processing" | "success" | "error"
  >("confirm");
  const [error, setError] = useState<string | null>(null);

  const handleConfirmPurchases = async () => {
    setStep("processing");

    // Simulate blockchain transaction
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate random success/failure
      if (Math.random() > 0.3) {
        setStep("success");
      } else {
        setError("Transaction failed. Insufficient gas fees.");
        setStep("error");
      }
    } catch (err) {
      setError("An error occurred during the transaction.");
      setStep("error");
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setError(null);
    onClose();
  };

  const handleReset = () => {
    setStep("confirm");
    setError(null);
  };

  const depositEarnest = async (
    signer: Signer,
    nftId: string,
    amount: number
  ) => {
    console.log("Depositing Earnest:", amount);
    const escrow = new ethers.Contract(escrowAddress, Escrow.abi, signer);
    const tx = await escrow.depositEarnest(nftId, {
      value: amount,
    });

    await tx.wait();
    return tx.hash;
  };

  // const sendLoanAmount = async (signer: Signer, loanAmount: bigint) => {
  //   console.log("Sending Loan Amount:", ethers.formatEther(loanAmount), "ETH");
  //   console.log("Sending Loan Amount in wei:", loanAmount);
  //   const tx = await signer.sendTransaction({
  //     to: escrowAddress,
  //     value: loanAmount,
  //   });
  //   await tx.wait();
  //   return tx.hash;
  // };

  const finalizeSale = async (nftId: string, escrow: Contract, signer: Signer) => {
    console.log("Purchase amount:", await escrow.purchaseAmount(nftId));
    // 🔍 CHECK BALANCE BEFORE FINALIZE
    const provider = signer.provider;
    if (!provider) {
      alert("Signer has no provider");
      return
    }
    const contractBal = await provider.getBalance(escrowAddress);
    console.log(
      "ESCROW BALANCE BEFORE FINALIZE:",
      contractBal
    );

    const tx = await escrow.finalizeSale(nftId);
    await tx.wait();
    return tx.hash;
  };

  const handleConfirmPurchase = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to proceed with the purchase.");
      return;
    }
    const metamask = getMetaMaskProvider();
    const provider = new ethers.BrowserProvider(metamask);
    const signer = await provider.getSigner();
    const escrow = new ethers.Contract(escrowAddress, Escrow.abi, signer);
    const purchaseAmount = await escrow.purchaseAmount(nft.id);

    //buyer pay the deposit earnest
    await depositEarnest(signer, nft.id, purchaseAmount);

    //finalize the sale and transfer the ownership
    await finalizeSale(nft?.id, escrow, signer);
    console.log("NFT purchased successfully");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === "confirm" && "Confirm Purchase"}
            {step === "processing" && "Processing Transaction"}
            {step === "success" && "Purchase Successful"}
            {step === "error" && "Transaction Failed"}
          </DialogTitle>
          <DialogDescription>
            {step === "confirm" &&
              "Review the transaction details before proceeding."}
            {step === "processing" &&
              "Please wait while your transaction is being processed..."}
            {step === "success" && "Your NFT has been successfully purchased!"}
            {step === "error" && "Something went wrong during the transaction."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === "confirm" && (
            <>
              <div className="bg-muted/40 rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">
                    NFT Name
                  </span>
                  <span className="font-semibold text-foreground">
                    {nft?.name}
                  </span>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">
                    Price
                  </span>
                  <span className="font-semibold text-primary text-lg">
                    {extractPrice(nft)} ETH
                  </span>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">
                    Gas Fee (Est.)
                  </span>
                  <span className="font-semibold text-foreground">
                    0.05 ETH
                  </span>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground font-semibold">
                    Total
                  </span>
                  <span className="font-bold text-primary text-lg">
                    {(parseFloat(extractPrice(nft) as string) + 0.05).toFixed(
                      2
                    )}{" "}
                    ETH
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleConfirmPurchase}
                  className="w-full bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground h-11 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Proceed to Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full rounded-lg font-medium hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <p className="font-semibold text-foreground">
                  Confirming transaction...
                </p>
                <p className="text-sm text-muted-foreground">
                  This may take a few moments.
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
                <CheckCircle2 className="w-12 h-12 text-green-500 relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-foreground text-lg">
                  Transaction Complete
                </p>
                <p className="text-sm text-muted-foreground">
                  Your NFT is now in your wallet
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-4 bg-muted/40 px-3 py-2 rounded-lg">
                  Tx: 0x{Math.random().toString(16).slice(2, 10)}...
                </p>
              </div>
              <Button
                onClick={handleClose}
                className="w-full bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground h-11 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 mt-4"
              >
                Close
              </Button>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 bg-destructive/20 rounded-full animate-pulse" />
                <AlertCircle className="w-12 h-12 text-destructive relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-foreground text-lg">
                  Transaction Failed
                </p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <div className="space-y-2 w-full pt-2">
                <Button
                  onClick={handleReset}
                  className="w-full bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground h-11 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full rounded-lg font-medium hover:bg-muted/50 transition-colors"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
