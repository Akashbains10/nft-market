'use client'

import { useState } from 'react'
import { Heart, Share2 } from 'lucide-react'

interface NFTDetailHeroProps {
  image: string
  name: string
  isLiked?: boolean
  onLikeChange?: (liked: boolean) => void
}

export default function NFTDetailHero({
  image,
  name,
  isLiked = false,
  onLikeChange,
}: NFTDetailHeroProps) {
  const [liked, setLiked] = useState(isLiked)

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    onLikeChange?.(newLiked)
  }

  return (
    <div className="relative w-full h-96 md:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background shadow-lg group">
      <img
        src={image || "/placeholder.svg"}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

      {/* Action buttons with glass morphism */}
      <div className="absolute top-6 right-6 flex gap-3">
        <button
          onClick={handleLike}
          className="bg-white/80 dark:bg-black/50 backdrop-blur-md p-3.5 rounded-xl hover:bg-white/90 dark:hover:bg-black/60 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 group/btn"
          aria-label="Like NFT"
        >
          <Heart
            className={`w-6 h-6 transition-all duration-300 ${
              liked
                ? 'fill-red-500 text-red-500 scale-110'
                : 'text-gray-600 dark:text-gray-300 group-hover/btn:text-red-400'
            }`}
          />
        </button>
        <button
          className="bg-white/80 dark:bg-black/50 backdrop-blur-md p-3.5 rounded-xl hover:bg-white/90 dark:hover:bg-black/60 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 group/btn"
          aria-label="Share NFT"
        >
          <Share2 className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover/btn:text-primary transition-colors" />
        </button>
      </div>
    </div>
  )
}
