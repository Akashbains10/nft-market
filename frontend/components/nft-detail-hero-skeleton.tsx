export default function NFTDetailHeroSkeleton() {
  return (
    <div className="relative w-full h-96 md:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background shadow-lg animate-pulse">
      <div className="w-full h-full bg-gradient-to-br from-muted/40 to-muted/20" />

      {/* Action buttons skeleton */}
      <div className="absolute top-6 right-6 flex gap-3">
        <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md w-14 h-14 rounded-xl" />
        <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md w-14 h-14 rounded-xl" />
      </div>
    </div>
  )
}
