export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* NavBar skeleton */}
      <div className="h-16 bg-surface-container-low border-b border-outline-variant/20 animate-pulse" />

      <main className="pt-24 px-4 md:px-8 pb-24 md:pb-12 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="h-10 w-72 bg-surface-container-low rounded-lg animate-pulse" />
              <div className="h-4 w-96 bg-surface-container-low rounded animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-11 w-36 bg-surface-container-low rounded-lg animate-pulse" />
              <div className="h-11 w-36 bg-surface-container-low rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Bento grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
            <div className="md:col-span-8 h-64 bg-surface-container-low rounded-xl animate-pulse" />
            <div className="md:col-span-4 h-64 bg-surface-container-low rounded-xl animate-pulse" />
            <div className="md:col-span-4 h-48 bg-surface-container-low rounded-xl animate-pulse" />
            <div className="md:col-span-8 h-48 bg-surface-container-low rounded-xl animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
