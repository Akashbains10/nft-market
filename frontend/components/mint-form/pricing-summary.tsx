"use client"

interface PricingSummaryProps {
  priceETH: string
}

export function PricingSummary({ priceETH }: PricingSummaryProps) {

  if (!priceETH) return null

  return (
    <div className="p-6 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
      <h4 className="font-semibold text-foreground">Price Summary</h4>
      <div className="space-y-2 text-sm">
        {priceETH && (
          <div className="flex justify-between text-foreground">
            <span>Ethereum (ETH)</span>
            <span className="font-mono font-semibold">{priceETH} ETH</span>
          </div>
        )}
        {/* {priceUSDC && (
          <div className="flex justify-between text-foreground">
            <span>USD Coin (USDC)</span>
            <span className="font-mono font-semibold">${priceUSDC} USDC</span>
          </div>
        )}
        {priceUSDT && (
          <div className="flex justify-between text-foreground">
            <span>Tether (USDT)</span>
            <span className="font-mono font-semibold">${priceUSDT} USDT</span>
          </div>
        )} */}
      </div>
    </div>
  )
}
