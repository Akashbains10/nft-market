import { Package, Plus } from "lucide-react"
import Link from "next/link"

export function EmptyState() {
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
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">Start Your NFT Collection</h3>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-sm mx-auto">
            You don't have any NFTs yet. Create your first NFT to begin building your digital portfolio.
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href="/mint"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <Plus size={20} />
          Create Your First NFT
        </Link>

        {/* Additional info */}
        <p className="text-sm text-muted-foreground pt-4">It only takes a few minutes to mint your NFT</p>
      </div>
    </div>
  )
}
