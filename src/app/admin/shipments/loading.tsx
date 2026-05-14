export default function Loading() {
  return (
    <div className="min-h-screen bg-bone pt-24 pb-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="h-6 w-48 bg-surface-low animate-shimmer rounded mb-3" />
        <div className="h-16 w-96 bg-surface-low animate-shimmer rounded mb-12" />

        <div className="h-12 w-full max-w-md bg-surface-low animate-shimmer rounded mb-4" />
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-surface-low animate-shimmer rounded" />
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-surface-low animate-shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}