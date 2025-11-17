'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface NFTDetailsTabsProps {
  description: string
  contractAddress: string
  tokenId: string
  blockchain: string
}

export default function NFTDetailsTabs({
  description,
  contractAddress,
  tokenId,
  blockchain,
}: NFTDetailsTabsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-muted/40 p-1 rounded-lg">
        <TabsTrigger
          value="description"
          className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
        >
          Description
        </TabsTrigger>
        <TabsTrigger
          value="details"
          className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
        >
          Details
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="space-y-4 mt-6">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light text-pretty">
              {description}
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="details" className="space-y-4 mt-6">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-center bg-gradient-to-r from-muted/40 to-muted/20 px-4 py-3.5 rounded-lg group hover:from-muted/60 hover:to-muted/30 transition-all">
              <span className="text-sm font-semibold text-muted-foreground">
                Contract Address
              </span>
              <button
                onClick={() => handleCopy(contractAddress, 'contract')}
                className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <code className="text-xs font-mono text-primary font-semibold bg-primary/10 px-2 py-1 rounded">
                  {contractAddress}
                </code>
                {copiedField === 'contract' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center bg-gradient-to-r from-muted/40 to-muted/20 px-4 py-3.5 rounded-lg group hover:from-muted/60 hover:to-muted/30 transition-all">
              <span className="text-sm font-semibold text-muted-foreground">Token ID</span>
              <button
                onClick={() => handleCopy(tokenId, 'tokenId')}
                className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <code className="text-xs font-mono text-primary font-semibold bg-primary/10 px-2 py-1 rounded">
                  {tokenId}
                </code>
                {copiedField === 'tokenId' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center bg-gradient-to-r from-muted/40 to-muted/20 px-4 py-3.5 rounded-lg">
              <span className="text-sm font-semibold text-muted-foreground">Blockchain</span>
              <span className="text-sm font-semibold text-foreground bg-accent/20 text-accent px-3 py-1 rounded-lg">
                {blockchain}
              </span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
