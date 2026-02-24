import { Skeleton } from "@/app/comps/ui/skeleton"

/**
 * Info page loading state
 * Shows minimal skeleton for the info page layout
 */
export default function InfoLoading() {
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="max-w-2xl w-full px-8">
        <Skeleton className="h-12 w-64 mx-auto rounded-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 mx-auto rounded" />
          <Skeleton className="h-4 w-4/6 mx-auto rounded" />
        </div>
      </div>
    </div>
  )
}
