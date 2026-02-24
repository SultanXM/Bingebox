import { SkeletonGrid } from "@/app/comps/ui/skeleton"

/**
 * Bookmarked/Watchlist page loading state
 * Shows grid layout skeleton with header
 */
export default function BookmarkedLoading() {
  return <SkeletonGrid count={12} />
}
