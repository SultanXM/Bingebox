import { cn } from "@/app/lib/utils"

/**
 * Enhanced Skeleton component with smooth shimmer animation
 * Provides pixel-perfect loading states matching actual content dimensions
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-neutral-800/60",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:animate-shimmer-wave",
        "before:bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Skeleton with pulse animation - for elements that need breathing effect
 */
function SkeletonPulse({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-800/50",
        className
      )}
      {...props}
    />
  )
}

/**
 * Card skeleton for content cards with exact dimensions
 */
function SkeletonCard({ 
  className,
  size = "default"
}: { 
  className?: string
  size?: "small" | "default" | "large"
}) {
  const sizeClasses = {
    small: "w-[120px] sm:w-[140px] md:w-[160px]",
    default: "w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]",
    large: "w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]"
  }

  return (
    <div className={cn("flex-shrink-0", sizeClasses[size], className)}>
      <Skeleton className="relative aspect-[2/3] overflow-hidden rounded-lg" />
      {/* Title skeleton */}
      <div className="mt-2 space-y-1.5">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

/**
 * Content row skeleton with title and horizontal scroll of cards
 */
function SkeletonRow({ 
  count = 6,
  size = "default"
}: { 
  count?: number
  size?: "small" | "default" | "large"
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Title skeleton */}
      <div className="px-4 sm:px-6 mb-3">
        <Skeleton className="h-6 sm:h-7 w-40 sm:w-48 rounded" />
      </div>
      
      {/* Cards row */}
      <div className="flex gap-2 sm:gap-3 px-4 sm:px-6 overflow-hidden">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} size={size} />
        ))}
      </div>
    </div>
  )
}

/**
 * Hero banner skeleton - pixel-perfect match to actual HeroBanner
 */
function SkeletonHero() {
  return (
    <div className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden bg-neutral-900">
      {/* Background gradient placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
      
      {/* Cinematic gradient overlay matching actual hero */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 via-70% to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/60 via-transparent to-transparent" />
      
      {/* Content skeleton - positioned exactly like real content */}
      <div className="absolute bottom-8 left-0 right-0 p-[4%] z-30">
        <div className="max-w-xl space-y-4">
          {/* Title skeleton - matching text-2xl md:text-4xl lg:text-5xl */}
          <Skeleton className="h-8 sm:h-10 md:h-12 lg:h-14 w-2/3 rounded-lg" />
          
          {/* Rating and year skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 rounded" />
            <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 rounded" />
          </div>
          
          {/* Description skeleton - 3 lines matching max-w-lg */}
          <div className="space-y-2 max-w-lg">
            <Skeleton className="h-3.5 sm:h-4 w-full rounded" />
            <Skeleton className="h-3.5 sm:h-4 w-5/6 rounded" />
            <Skeleton className="h-3.5 sm:h-4 w-4/6 rounded" />
          </div>
          
          {/* Button skeleton - matching px-5 py-2 */}
          <Skeleton className="h-9 sm:h-10 w-32 sm:w-36 rounded mt-2" />
        </div>
      </div>
    </div>
  )
}

/**
 * Full browser skeleton combining hero and content rows
 */
function SkeletonBrowser({ rows = 4 }: { rows?: number }) {
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero skeleton */}
      <SkeletonHero />
      
      {/* Content type switcher skeleton */}
      <div className="relative z-30 -mt-8 flex justify-center px-4 mb-4">
        <Skeleton className="h-10 sm:h-12 w-64 sm:w-80 rounded-full" />
      </div>
      
      {/* Content rows skeleton */}
      <div className="relative z-20 pt-6">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonRow key={index} count={6} />
        ))}
        
        {/* Loading indicator at bottom */}
        <div className="h-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white" />
        </div>
      </div>
    </div>
  )
}

/**
 * Movie/TV Detail page skeleton - pixel-perfect to actual layout
 */
function SkeletonDetail() {
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Backdrop banner skeleton - h-[50vh] sm:h-[60vh] */}
      <div className="relative h-[50vh] sm:h-[60vh]">
        <Skeleton className="absolute inset-0 rounded-none" />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/30 to-transparent" />
        
        {/* Back button skeleton */}
        <div className="absolute top-20 left-4 sm:left-8 z-10">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Content section - matching max-w-7xl with negative margin */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-40 relative z-10">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-10">
          {/* Poster skeleton - hidden on mobile */}
          <div className="hidden lg:block">
            <Skeleton className="aspect-[2/3] rounded-xl" />
          </div>

          {/* Info section */}
          <div className="space-y-5">
            {/* Title */}
            <Skeleton className="h-8 sm:h-10 lg:h-12 w-3/4 rounded" />
            
            {/* Rating, year, runtime row */}
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-8 rounded" />
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>

            {/* Overview - 4 lines */}
            <div className="space-y-2 max-w-3xl">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/6 rounded" />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 sm:h-11 w-32 sm:w-36 rounded-full" />
              <Skeleton className="h-10 sm:h-11 w-28 sm:w-32 rounded-full" />
              <Skeleton className="h-10 sm:h-11 w-28 sm:w-32 rounded-full" />
              <Skeleton className="h-10 sm:h-11 w-12 rounded-full" />
            </div>
          </div>
        </div>

        {/* Video player section */}
        <div className="mt-8 space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          
          {/* Source selector */}
          <div className="flex items-center gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
          </div>
        </div>

        {/* Cast section */}
        <div className="mt-12">
          <Skeleton className="h-6 w-16 rounded mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-28 text-center">
                <Skeleton className="w-28 h-28 rounded-full mb-2" />
                <Skeleton className="h-4 w-24 mx-auto rounded mb-1" />
                <Skeleton className="h-3 w-16 mx-auto rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Gallery section */}
        <div className="mt-12">
          <Skeleton className="h-6 w-20 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-lg" />
            ))}
          </div>
        </div>

        {/* More Like This section */}
        <div className="mt-12 pb-12">
          <Skeleton className="h-6 w-32 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Grid page skeleton (for liked, bookmarked pages)
 */
function SkeletonGrid({ 
  count = 12,
  headerWidth = 48 
}: { 
  count?: number
  headerWidth?: number
}) {
  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </div>
          
          {/* Search skeleton */}
          <Skeleton className="h-10 w-full sm:w-64 rounded-full" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * History page skeleton - list layout
 */
function SkeletonHistory() {
  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-full sm:w-64 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-full hidden sm:block" />
          </div>
        </div>

        {/* List items skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl">
              <Skeleton className="w-16 h-24 sm:w-20 sm:h-28 flex-shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-14 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Search page skeleton
 */
function SkeletonSearch() {
  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search header */}
        <div className="mb-8">
          <Skeleton className="h-12 w-full max-w-2xl rounded-full mx-auto" />
        </div>

        {/* Search results grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonPulse,
  SkeletonCard, 
  SkeletonRow, 
  SkeletonHero, 
  SkeletonBrowser,
  SkeletonDetail,
  SkeletonGrid,
  SkeletonHistory,
  SkeletonSearch
}
