"use client"

import type React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PricingCard } from "./pricing-card"
import { PricingSummary } from "./pricing-summary"
import type { FormData } from "./types"

interface PricingStepProps {
  formData: FormData
  errors: Record<string, string>
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBack: () => void
  onNext: () => void
  isPricingValid: boolean
}

export function PricingStep({ formData, errors, onInputChange, onBack, onNext, isPricingValid }: PricingStepProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden p-8 space-y-8 animate-in fade-in duration-300">
      {errors.pricing && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">{errors.pricing}</p>
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
          onChange={(e) => onInputChange({ ...e, target: { ...e.target, name: "priceETH" } })}
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
              : "opacity-50 cursor-not-allowed",
          )}
        >
          Review NFT
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
