"use client"

import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CurrentStep } from "./types"

interface StepIndicatorProps {
  currentStep: CurrentStep
  isDetailsValid: boolean
  isPricingValid: boolean
}

export function StepIndicator({ currentStep, isDetailsValid, isPricingValid }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {/* Step 1 */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200",
            currentStep === "details"
              ? "bg-primary text-primary-foreground"
              : isDetailsValid
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground",
          )}
        >
          {isDetailsValid ? <CheckCircle className="w-5 h-5" /> : "1"}
        </div>
        <span
          className={cn(
            "text-sm font-medium transition-all duration-200",
            currentStep === "details" || isDetailsValid ? "text-foreground" : "text-muted-foreground",
          )}
        >
          NFT Details
        </span>
      </div>

      <div className="flex-1 h-1 bg-border rounded-full" />

      {/* Step 2 */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200",
            currentStep === "pricing"
              ? "bg-primary text-primary-foreground"
              : currentStep === "review" || (isDetailsValid && isPricingValid)
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground",
          )}
        >
          {currentStep === "review" || (isDetailsValid && isPricingValid) ? <CheckCircle className="w-5 h-5" /> : "2"}
        </div>
        <span
          className={cn(
            "text-sm font-medium transition-all duration-200",
            isDetailsValid ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Pricing
        </span>
      </div>

      <div className="flex-1 h-1 bg-border rounded-full" />

      {/* Step 3 */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200",
            currentStep === "review"
              ? "bg-primary text-primary-foreground"
              : isDetailsValid && isPricingValid
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground",
          )}
        >
          3
        </div>
        <span
          className={cn(
            "text-sm font-medium transition-all duration-200",
            isDetailsValid && isPricingValid ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Review
        </span>
      </div>
    </div>
  )
}
