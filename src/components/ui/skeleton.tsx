import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
  animation?: "pulse" | "wave" | "shimmer";
  width?: string | number;
  height?: string | number;
}

function Skeleton({ 
  className, 
  variant = "default",
  animation = "shimmer",
  width,
  height,
  style,
  ...props 
}: SkeletonProps) {
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4",
  };
  
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse",
    shimmer: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
  };

  return (
    <div 
      className={cn(
        "bg-muted",
        variantClasses[variant],
        animationClasses[animation],
        className
      )} 
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...props} 
    />
  );
}

// Pre-built skeleton components for common use cases
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-card rounded-xl p-6 space-y-4", className)} {...props}>
      <div className="flex items-start justify-between">
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton width={80} height={28} className="rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton width="80%" height={24} />
        <Skeleton width="60%" height={20} />
      </div>
      <div className="flex gap-2">
        <Skeleton width={60} height={24} className="rounded-full" />
        <Skeleton width={80} height={24} className="rounded-full" />
        <Skeleton width={70} height={24} className="rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton width={120} height={16} />
        <Skeleton width={100} height={36} className="rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 3, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { count?: number }) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-lg">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={20} />
            <Skeleton width="50%" height={16} />
          </div>
          <Skeleton width={80} height={32} className="rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function SkeletonAvatar({ size = 40, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} className={className} {...props} />;
}

function SkeletonText({ lines = 3, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          width={i === lines - 1 ? "60%" : "100%"} 
          height={16} 
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonList, SkeletonAvatar, SkeletonText };
