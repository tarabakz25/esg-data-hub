"use client"

import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  unit?: string
  status?: "good" | "warning" | "error" | "neutral"
  className?: string
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  unit,
  status = "neutral",
  className
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-error" />
      case "neutral":
        return <Minus className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const getStatusStyles = () => {
    switch (status) {
      case "good":
        return "border-primary/20 bg-primary/5 hover:bg-primary/10"
      case "warning":
        return "border-warning/20 bg-warning/5 hover:bg-warning/10"
      case "error":
        return "border-error/20 bg-error/5 hover:bg-error/10"
      default:
        return "border-border bg-card hover:bg-muted/50"
    }
  }

  const getValueColor = () => {
    switch (status) {
      case "good":
        return "text-primary"
      case "warning":
        return "text-warning"
      case "error":
        return "text-error"
      default:
        return "text-foreground"
    }
  }

  const getIconColor = () => {
    switch (status) {
      case "good":
        return "text-primary"
      case "warning":
        return "text-warning"
      case "error":
        return "text-error"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md border",
      getStatusStyles(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {status === "error" && (
            <AlertTriangle className="h-4 w-4 text-error" />
          )}
          {Icon && <Icon className={cn("h-4 w-4", getIconColor())} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold mb-1", getValueColor())}>
          {value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        
        {(description || trend) && (
          <div className="flex items-center justify-between text-xs">
            {trend && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                {trendValue && (
                  <span className={cn(
                    "font-medium",
                    trend === "up" ? "text-success" : 
                    trend === "down" ? "text-error" : 
                    "text-muted-foreground"
                  )}>
                    {trendValue}
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className="text-muted-foreground truncate">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 