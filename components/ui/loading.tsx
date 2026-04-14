import * as React from "react"

import { cn } from "@/lib/utils"

const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border border-current border-t-transparent",
        className
      )}
      {...props}
    />
  )
})
LoadingSpinner.displayName = "LoadingSpinner"

const LoadingDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex space-x-1",
        className
      )}
      {...props}
    >
      <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  )
})
LoadingDots.displayName = "LoadingDots"

const LoadingSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
})
LoadingSkeleton.displayName = "LoadingSkeleton"

export { LoadingSpinner, LoadingDots, LoadingSkeleton }