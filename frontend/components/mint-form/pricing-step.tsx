"use client";

import type React from "react";
import { ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingCard } from "./pricing-card";
import { PricingSummary } from "./pricing-summary";
import type { FormData } from "./types";

interface PricingStepProps {
  formData: FormData;
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onNext: () => void;
  isPricingValid: boolean;
}

export function PricingStep({
  formData,
  errors,
  onInputChange,
  onBack,
  onNext,
  isPricingValid,
}: PricingStepProps) {

  const royaltyError =
    formData.royaltyPercentage !== "" &&
    (isNaN(Number(formData.royaltyPercentage)) ||
      Number(formData.royaltyPercentage) < 0 ||
      Number(formData.royaltyPercentage) > 20);

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden p-8 space-y-8 animate-in fade-in duration-300">
      {errors.pricing && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">
            {errors.pricing}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <PricingCard
          icon="Ξ"
          title="Ethereum"
          symbol="ETH"
          subtitle="Ethereum Network"
          value={formData.priceETH}
          placeholder="Enter price in ETH"
          onChange={(e) =>
            onInputChange({ ...e, target: { ...e.target, name: "priceETH" } })
          }
          step="0.0001"
          gradientFrom="from-slate-50"
          gradientTo="to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50"
        />

        {/* <PricingCard
          icon="U"
          title="USD Coin"
          symbol="USDC"
          subtitle="Multiple Networks"
          value={formData.priceUSDC}
          placeholder="Enter price in USDC"
          onChange={(e) => onInputChange({ ...e, target: { ...e.target, name: "priceUSDC" } })}
          step="0.01"
          gradientFrom="from-blue-50"
          gradientTo="to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50"
        />

        <PricingCard
          icon="T"
          title="Tether"
          symbol="USDT"
          subtitle="Multiple Networks"
          value={formData.priceUSDT}
          placeholder="Enter price in USDT"
          onChange={(e) => onInputChange({ ...e, target: { ...e.target, name: "priceUSDT" } })}
          step="0.01"
          gradientFrom="from-green-50"
          gradientTo="to-green-100 dark:from-green-900/50 dark:to-green-800/50"
        /> */}
      </div>

      <PricingSummary priceETH={formData.priceETH} />

      <div className="space-y-6 pt-6 border-t border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Royalty Settings
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Set a royalty percentage to earn ongoing revenue from secondary
            sales of your NFT. This allows you to benefit from the success of
            your art as it appreciates and changes hands in the marketplace.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="royaltyPercentage"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Royalty Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                id="royaltyPercentage"
                name="royaltyPercentage"
                value={formData.royaltyPercentage}
                onChange={(e) =>
                  onInputChange({
                    ...e,
                    target: { ...e.target, name: "royaltyPercentage" },
                  })
                }
                placeholder="Enter percentage (0-20%)"
                min="0"
                max="20"
                step="0.1"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border bg-background text-foreground transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  royaltyError
                    ? "border-destructive focus:ring-destructive"
                    : "border-border hover:border-primary/50"
                )}
              />
            </div>
            {royaltyError && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <Info className="w-4 h-4" />
                Royalty percentage must be between 0% and 20%
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" />
              Note: The royalty percentage must be less than 20%
            </p>
          </div>

          <div>
            <label
              htmlFor="royaltyRecipient"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Royalty Recipient Address
            </label>
            <input
              type="text"
              id="royaltyRecipient"
              name="royaltyRecipient"
              value={formData.royaltyRecipient}
              onChange={onInputChange}
              placeholder="0x... (optional)"
              className={cn(
                "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "hover:border-primary/50"
              )}
            />
            {!formData.royaltyRecipient && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                Leaving this field empty will default to your connected wallet
                address
              </p>
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
          <p className="text-sm text-foreground/80 leading-relaxed">
            <span className="font-semibold text-primary">
              Why set royalties?
            </span>{" "}
            Royalties allow you to earn a percentage from every future sale of
            your NFT. As your artwork gains value and is resold, you'll continue
            to benefit from its success—creating a sustainable income stream
            from your creative work.
          </p>
        </div>
      </div>

      <div className="flex gap-4 justify-between pt-4 border-t border-border">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted hover:border-primary transition-all duration-200 hover:shadow-md"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isPricingValid}
          className={cn(
            "px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium transition-all duration-200 flex items-center gap-2",
            isPricingValid
              ? "hover:shadow-lg hover:shadow-primary/25 hover:scale-105 cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          )}
        >
          Review NFT
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
