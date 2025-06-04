import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-muted/50 via-muted to-muted/50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]",
        className
      )}
      style={{
        backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        animation: "shimmer 2s ease-in-out infinite"
      }}
      {...props}
    />
  )
}

export { Skeleton } 