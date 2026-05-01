export default function LibraryLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* NavBar skeleton */}
      <div className="h-16 bg-surface-container-low border-b border-outline-variant/20 animate-pulse" />

      <main className="mt-16 p-4 md:p-8 min-h-screen pb-24 md:pb-12">
        {/* Header skeleton */}
        <div className="max-w-6xl mx-auto mb-8 md:mb-16">
          <div className="h-16 w-64 bg-surface-container-low rounded-lg animate-pulse mb-4" />
          <div className="h-4 w-96 bg-surface-container-low rounded animate-pulse" />
        </div>

        {/* Pathways skeleton */}
        <div className="max-w-6xl mx-auto mb-8 flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-56 md:w-64 h-24 bg-surface-container-low rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Search skeleton */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="h-12 w-full bg-surface-container-low rounded-xl animate-pulse" />
        </div>

        {/* Challenge cards skeleton */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="md:col-span-2 lg:col-span-2 h-64 bg-surface-container-low rounded-xl animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-surface-container-low rounded-xl animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
