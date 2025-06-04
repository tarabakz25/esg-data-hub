import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertTriangle, XCircle, Clock, Minus } from "lucide-react"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: 'success' | 'warning' | 'error' | 'pending' | 'neutral'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, showIcon = true, size = 'md', children, ...props }, ref) => {
    const getStatusConfig = () => {
      switch (status) {
        case 'success':
          return {
            className: "status-success",
            icon: CheckCircle,
            label: children || "Success"
          }
        case 'warning':
          return {
            className: "status-warning",
            icon: AlertTriangle,
            label: children || "Warning"
          }
        case 'error':
          return {
            className: "status-error",
            icon: XCircle,
            label: children || "Error"
          }
        case 'pending':
          return {
            className: "bg-secondary/10 text-secondary border-secondary/20",
            icon: Clock,
            label: children || "Pending"
          }
        case 'neutral':
        default:
          return {
            className: "bg-muted text-muted-foreground border-border",
            icon: Minus,
            label: children || "Neutral"
          }
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return "px-2 py-0.5 text-xs"
        case 'lg':
          return "px-3 py-1 text-sm"
        default:
          return "px-2.5 py-0.5 text-xs"
      }
    }

    const config = getStatusConfig()
    const Icon = config.icon

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md border font-medium transition-colors",
          getSizeClasses(),
          config.className,
          className
        )}
        {...props}
      >
        {showIcon && <Icon className={cn("mr-1.5", size === 'sm' ? "h-3 w-3" : "h-4 w-4")} />}
        {config.label}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge } 