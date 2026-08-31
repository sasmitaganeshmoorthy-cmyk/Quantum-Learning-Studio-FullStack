export default function Loading() {
  return (
    <main id="main-content" className="page-container py-8" aria-busy="true" aria-label="Loading page">
      <div className="animate-pulse space-y-6" role="status">
        <span className="sr-only">Loading content</span>
        <div className="h-9 w-3/5 max-w-md rounded-medium bg-border-color/50" />
        <div className="h-5 w-4/5 max-w-2xl rounded-medium bg-border-color/40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 rounded-large border border-border-color bg-surface" />
          ))}
        </div>
      </div>
    </main>
  );
}
