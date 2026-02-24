import { SkeletonBrowser } from "@/app/comps/ui/skeleton"

/**
 * Main page loading state
 * Shows hero banner skeleton with content rows
 */
export default function MainLoading() {
  return <SkeletonBrowser rows={5} />
}
