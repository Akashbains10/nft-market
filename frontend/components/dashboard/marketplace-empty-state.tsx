import { Package, Plus } from "lucide-react"
import Link from "next/link"

export function MarketPlaceEmptyState() {
  return (
    <div className="py-24 px-4 text-center">
      <div className="max-w-md mx-auto space-y-6">
        {/* Icon with gradient background */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-2xl" />
          <div className="relative p-6 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full border border-primary/20">
            <Package size={48} className="text-primary" />
          </div>
        </div>

        {/* Heading and description */}
        <div className="space-y-3">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">No NFTs listed yet.</h3>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-sm mx-auto">
            Stay tuned for upcoming releases and featured assets.
          </p>
        </div>
      </div>
    </div>
  )
}
