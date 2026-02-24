import { SkeletonGrid } from "@/app/comps/ui/skeleton"

/**
 * Liked page loading state
 * Shows grid layout skeleton with header
 */
export default function LikedLoading() {
  return <SkeletonGrid count={12} />
}
