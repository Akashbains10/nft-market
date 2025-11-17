import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface NFTInfoCardProps {
  name: string
  collection: string
  rarity: string
  price: string
  priceUSD: string
  creator: string
  owner: string
}

export default function NFTInfoCard({
  name,
  collection,
  rarity,
  price,
  priceUSD,
  creator,
  owner,
}: NFTInfoCardProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  return (
    <Card className="border-border/50 shadow-md hover:shadow-lg transition-shadow duration-300 sticky top-24">
      <CardHeader className="pb-4 border-b border-border/30">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl md:text-3xl font-bold text-balance">
              {name}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">{collection}</p>
          </div>
          <Badge
            variant="default"
            className={`capitalize font-semibold whitespace-nowrap ${
              rarity === 'legendary'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                : rarity === 'epic'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  : rarity === 'rare'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
            }`}
          >
            {rarity}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <div className="bg-gradient-to-br from-primary/15 via-accent/10 to-background rounded-xl p-5 border border-primary/20">
          <p className="text-xs text-muted-foreground font-semibold tracking-wide mb-2">
            CURRENT PRICE
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {price}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">ETH</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{priceUSD}</p>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-semibold tracking-wide">
              CREATOR
            </p>
            <div className="flex items-center justify-between gap-2 bg-muted/40 px-3 py-2.5 rounded-lg group/addr hover:bg-muted/60 transition-colors">
              <a
                href="#"
                className="text-sm font-mono text-primary hover:text-accent font-semibold flex items-center gap-1 transition-colors flex-1 truncate"
              >
                {creator}
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              </a>
              <button
                onClick={() => handleCopyAddress(creator)}
                className="p-1.5 hover:bg-muted/80 rounded transition-colors opacity-0 group-hover/addr:opacity-100"
                aria-label="Copy creator address"
              >
                {copiedAddress === creator ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-semibold tracking-wide">
              OWNER
            </p>
            <div className="flex items-center justify-between gap-2 bg-muted/40 px-3 py-2.5 rounded-lg group/addr hover:bg-muted/60 transition-colors">
              <a
                href="#"
                className="text-sm font-mono text-primary hover:text-accent font-semibold flex items-center gap-1 transition-colors flex-1 truncate"
              >
                {owner}
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              </a>
              <button
                onClick={() => handleCopyAddress(owner)}
                className="p-1.5 hover:bg-muted/80 rounded transition-colors opacity-0 group-hover/addr:opacity-100"
                aria-label="Copy owner address"
              >
                {copiedAddress === owner ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 active:scale-95 text-primary-foreground text-base h-12 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 mt-4">
          View on Blockchain
        </button>
      </CardContent>
    </Card>
  )
}
