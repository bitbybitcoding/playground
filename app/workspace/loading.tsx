export default function WorkspaceLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* NavBar skeleton */}
      <div className="h-16 bg-surface-container-low border-b border-outline-variant/20 animate-pulse" />

      <main className="pt-24 px-4 md:px-12 pb-24 md:pb-16 min-h-screen">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="space-y-3">
            <div className="h-4 w-40 bg-surface-container-low rounded animate-pulse" />
            <div className="h-12 w-80 bg-surface-container-low rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-surface-container-low rounded animate-pulse" />
          </div>
          <div className="h-12 w-44 bg-surface-container-low rounded-xl animate-pulse" />
        </div>

        {/* Bento grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="col-span-1 lg:col-span-8 space-y-6">
            <div className="h-8 w-full bg-surface-container-low rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-surface-container-low rounded-2xl animate-pulse" />
              ))}
              <div className="md:col-span-2 h-36 bg-surface-container-low rounded-2xl animate-pulse" />
            </div>
          </div>
          <div className="col-span-1 lg:col-span-4 space-y-6">
            <div className="h-36 bg-surface-container-low rounded-2xl animate-pulse" />
            <div className="h-40 bg-surface-container-low rounded-2xl animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
