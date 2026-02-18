import { Skeleton } from "@/components/ui/skeleton";

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Animated logo pulse */}
        <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse shadow-[var(--shadow-emerald-glow)]">
          <span className="text-primary-foreground font-extrabold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>μ</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-32 mx-auto rounded-full animate-shimmer" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-card p-6 space-y-3 accent-bar-top">
          <div className="h-4 w-3/4 rounded-full animate-shimmer" />
          <div className="h-4 w-1/2 rounded-full animate-shimmer" />
          <div className="h-3 w-full rounded-full animate-shimmer" />
          <div className="h-3 w-5/6 rounded-full animate-shimmer" />
        </div>
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3">
          <div className="h-4 w-1/4 rounded-full animate-shimmer" />
          <div className="h-4 w-1/3 rounded-full animate-shimmer" />
          <div className="h-4 w-1/6 rounded-full animate-shimmer" />
          <div className="h-4 w-1/5 rounded-full animate-shimmer" />
        </div>
      ))}
    </div>
  );
}
