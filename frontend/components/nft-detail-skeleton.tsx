export default function NFTDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title and metadata section skeleton */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-12 bg-muted/50 rounded-lg w-3/4" />
              <div className="h-5 bg-muted/50 rounded w-1/3" />
            </div>
            <div className="h-9 w-24 bg-muted/50 rounded-lg" />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-3 pt-2">
            <div className="flex-1 h-12 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10" />
            <div className="flex-1 h-12 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10" />
          </div>
        </div>

        {/* Price section skeleton */}
        <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-background rounded-xl p-8 border border-primary/10 space-y-3">
          <div className="h-4 bg-muted/50 rounded w-24" />
          <div className="space-y-2">
            <div className="h-12 bg-muted/50 rounded w-32" />
            <div className="h-5 bg-muted/50 rounded w-24" />
          </div>
        </div>
      </div>

      {/* Description skeleton */}
      <div className="space-y-3">
        <div className="h-6 bg-muted/50 rounded w-40" />
        <div className="space-y-2">
          <div className="h-4 bg-muted/50 rounded w-full" />
          <div className="h-4 bg-muted/50 rounded w-5/6" />
          <div className="h-4 bg-muted/50 rounded w-4/6" />
        </div>
      </div>

      {/* Properties skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-muted/50 rounded w-32" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-5 border border-primary/10 space-y-3"
            >
              <div className="h-3 bg-muted/50 rounded w-16" />
              <div className="h-5 bg-muted/50 rounded w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Ownership section skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-muted/50 rounded w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/10 space-y-3"
            >
              <div className="h-3 bg-muted/50 rounded w-20" />
              <div className="h-5 bg-muted/50 rounded w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Blockchain details skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-muted/50 rounded w-40" />
        <div className="space-y-3">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-primary/5 to-accent/5 px-5 py-4 rounded-lg border border-primary/10 flex justify-between items-center"
            >
              <div className="h-4 bg-muted/50 rounded w-32" />
              <div className="h-5 bg-muted/50 rounded w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Purchase button skeleton */}
      <div className="h-14 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg" />
    </div>
  )
}
