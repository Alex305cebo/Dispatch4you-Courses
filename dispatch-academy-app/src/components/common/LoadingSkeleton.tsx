/**
 * Loading skeleton placeholder displayed while lazy-loaded routes are being fetched.
 * Shows animated pulse shapes that approximate the content layout.
 */
export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen p-4 animate-pulse" aria-label="Загрузка...">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-white/10 rounded-lg" />
        <div className="flex gap-3">
          <div className="h-8 w-16 bg-white/10 rounded-lg" />
          <div className="h-8 w-16 bg-white/10 rounded-lg" />
          <div className="h-8 w-16 bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-12 w-3/4 bg-white/10 rounded-lg" />
        <div className="h-6 w-full bg-white/10 rounded-lg" />
        <div className="h-6 w-5/6 bg-white/10 rounded-lg" />
        <div className="h-40 w-full bg-white/10 rounded-xl mt-6" />
        <div className="h-40 w-full bg-white/10 rounded-xl" />
        <div className="h-40 w-full bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}
