'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { mockNFTs } from '@/lib/mock-data'
import Header from '@/components/header'
import Footer from '@/components/footer'
import NFTDetailHero from '@/components/nft-detail-hero'
import NFTDetailContent from '@/components/nft-detail-content'
import useNFTStore from '@/store/useNFTStore'

export default function NFTDetailPage() {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)

  const {nftProperty: nft} = useNFTStore();

  if (!nft) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">NFT Not Found</h1>
              <p className="text-muted-foreground">
                The NFT you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Button
              onClick={() => router.push('/')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Back to Marketplace
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 px-3 py-2 rounded-lg transition-all duration-200 mb-12 group font-medium"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back
          </button>

          {/* Main content grid - changed to full-width single column layout */}
          <div className="grid grid-cols-1 gap-12">
            {/* Left column - Image */}
            <div className="space-y-8">
              <NFTDetailHero image={nft.image} name={nft.name} />
            </div>

            {/* Right column - All info combined in single view */}
            <div className="w-full max-w-3xl mx-auto">
              <NFTDetailContent
                nft={nft}
                isLiked={isLiked}
                onLikeChange={setIsLiked}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
