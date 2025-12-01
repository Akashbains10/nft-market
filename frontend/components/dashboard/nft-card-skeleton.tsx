export function NFTCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-64 overflow-hidden bg-muted" />

      {/* Content Skeleton */}
      <div className="p-5">
        {/* Title and Collection */}
        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2 mb-4" />

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-border">
          <div>
            <div className="h-3 bg-muted rounded w-12 mb-2" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
          <div>
            <div className="h-3 bg-muted rounded w-16 mb-2" />
            <div className="h-4 bg-muted rounded w-20" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-muted rounded-lg" />
          <div className="flex-1 h-10 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  )
}
