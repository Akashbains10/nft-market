"use client"

import type { Attribute } from "./types"

interface NFTPreviewCardProps {
  mediaPreview: string | null
  name: string
  collection: string
  description: string
  attributes: Attribute[]
  priceETH: string
  priceUSDC?: string
  priceUSDT?: string
  onEditDetails: () => void
  onEditPricing: () => void
}

export function NFTPreviewCard({
  mediaPreview,
  name,
  collection,
  description,
  attributes,
  priceETH,
  priceUSDC,
  priceUSDT,
  onEditDetails,
  onEditPricing,
}: NFTPreviewCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="aspect-square overflow-hidden bg-muted">
        {mediaPreview && (
          <img src={mediaPreview || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{name}</h2>
          {collection && <p className="text-sm text-muted-foreground">Collection: {collection}</p>}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {attributes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Attributes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {attributes.map((attr) => (
                <div key={attr.id} className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground font-medium">{attr.traitType}</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{attr.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Pricing</h3>
          <div className="space-y-3">
            {priceETH && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    Ξ
                  </div>
                  <span className="text-sm font-medium text-foreground">Ethereum (ETH)</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{priceETH} ETH</span>
              </div>
            )}
            {priceUSDC && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    U
                  </div>
                  <span className="text-sm font-medium text-foreground">USD Coin (USDC)</span>
                </div>
                <span className="text-sm font-semibold text-foreground">${priceUSDC} USDC</span>
              </div>
            )}
            {priceUSDT && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  <span className="text-sm font-medium text-foreground">Tether (USDT)</span>
                </div>
                <span className="text-sm font-semibold text-foreground">${priceUSDT} USDT</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-6 flex gap-3">
          <button
            onClick={onEditDetails}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted hover:border-primary transition-all duration-200"
          >
            Edit Details
          </button>
          <button
            onClick={onEditPricing}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted hover:border-primary transition-all duration-200"
          >
            Edit Pricing
          </button>
        </div>
      </div>
    </div>
  )
}
