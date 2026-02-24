import { SkeletonBrowser } from "@/app/comps/ui/skeleton"

/**
 * Root loading state - used while initial page is loading
 * Shows a full browser skeleton with hero banner and content rows
 */
export default function Loading() {
  return <SkeletonBrowser rows={4} />
}
