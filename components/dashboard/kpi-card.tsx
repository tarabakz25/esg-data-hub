"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  unit?: string
  status?: "good" | "warning" | "error"
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  unit,
  status = "good"
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "neutral":
        return <Minus className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "good":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "error":
        return "border-red-200 bg-red-50"
      default:
        return ""
    }
  }

  return (
    <Card className={`${getStatusColor()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-gray-600" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {value}
          {unit && <span className="text-sm font-normal text-gray-600 ml-1">{unit}</span>}
        </div>
        {(description || trend) && (
          <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
            {trend && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                {trendValue && <span>{trendValue}</span>}
              </div>
            )}
            {description && <p>{description}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 