export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-12 pb-32">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <div className="h-4 w-48 bg-[#efeee9] animate-shimmer rounded mb-3" />
            <div className="h-14 w-96 bg-[#efeee9] animate-shimmer rounded" />
          </div>
          <div className="h-10 w-48 bg-[#efeee9] animate-shimmer rounded-full" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[#efeee9] animate-shimmer rounded-xl" />
          ))}
        </div>

        <div className="h-12 w-full max-w-md bg-[#efeee9] animate-shimmer rounded mb-4" />
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 bg-[#efeee9] animate-shimmer rounded" />
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-[#efeee9] animate-shimmer rounded-2xl" />
          ))}
        </div>

        <div className="flex items-center justify-between mt-12 pt-8">
          <div className="h-4 w-24 bg-[#efeee9] animate-shimmer rounded" />
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-[#efeee9] animate-shimmer rounded" />
            <div className="h-10 w-10 bg-[#efeee9] animate-shimmer rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}