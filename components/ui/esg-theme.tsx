import * as React from "react"
import { cn } from "@/lib/utils"
import { Leaf, Users, Shield, TrendingUp, Globe, Recycle } from "lucide-react"
import { LucideIcon } from "lucide-react"

// ESG Category Icons
export const ESGIcons = {
  environment: Leaf,
  social: Users,
  governance: Shield,
  sustainability: Globe,
  growth: TrendingUp,
  circular: Recycle,
} as const

export type ESGCategory = keyof typeof ESGIcons

interface ESGIconProps {
  category: ESGCategory
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ESGIcon({ category, className, size = 'md' }: ESGIconProps) {
  const Icon = ESGIcons[category]
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return "h-4 w-4"
      case 'lg': return "h-6 w-6"
      case 'xl': return "h-8 w-8"
      default: return "h-5 w-5"
    }
  }

  const getCategoryColor = () => {
    switch (category) {
      case 'environment':
      case 'sustainability':
      case 'circular':
        return "text-primary"
      case 'social':
        return "text-secondary"
      case 'governance':
        return "text-accent"
      case 'growth':
        return "text-success"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Icon className={cn(getSizeClasses(), getCategoryColor(), className)} />
  )
}

interface ESGGradientBackgroundProps {
  category?: ESGCategory | 'full'
  className?: string
  children?: React.ReactNode
}

export function ESGGradientBackground({ 
  category = 'full', 
  className, 
  children 
}: ESGGradientBackgroundProps) {
  const getGradientClass = () => {
    switch (category) {
      case 'environment':
        return "primary-gradient"
      case 'social':
        return "secondary-gradient"
      case 'governance':
        return "accent-gradient"
      case 'full':
      default:
        return "esg-gradient"
    }
  }

  return (
    <div className={cn(getGradientClass(), className)}>
      {children}
    </div>
  )
}

interface ESGCategoryCardProps {
  category: ESGCategory
  title: string
  description?: string
  value?: string | number
  trend?: "up" | "down" | "neutral"
  className?: string
  children?: React.ReactNode
}

export function ESGCategoryCard({
  category,
  title,
  description,
  value,
  trend,
  className,
  children
}: ESGCategoryCardProps) {
  const getCategoryTheme = () => {
    switch (category) {
      case 'environment':
      case 'sustainability':
      case 'circular':
        return {
          bg: "bg-primary/5",
          border: "border-primary/20",
          text: "text-primary",
          accent: "bg-primary/10"
        }
      case 'social':
        return {
          bg: "bg-secondary/5",
          border: "border-secondary/20", 
          text: "text-secondary",
          accent: "bg-secondary/10"
        }
      case 'governance':
        return {
          bg: "bg-accent/5",
          border: "border-accent/20",
          text: "text-accent", 
          accent: "bg-accent/10"
        }
      default:
        return {
          bg: "bg-muted",
          border: "border-border",
          text: "text-foreground",
          accent: "bg-muted"
        }
    }
  }

  const theme = getCategoryTheme()

  return (
    <div className={cn(
      "rounded-lg border p-6 transition-all hover:shadow-md",
      theme.bg,
      theme.border,
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn("p-2 rounded-lg", theme.accent)}>
            <ESGIcon category={category} size="md" />
          </div>
          <div>
            <h3 className={cn("font-semibold", theme.text)}>{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {value && (
          <div className={cn("text-2xl font-bold", theme.text)}>
            {value}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

interface ESGMetricDisplayProps {
  label: string
  value: string | number
  unit?: string
  category: ESGCategory
  trend?: {
    direction: "up" | "down" | "neutral"
    value: string
  }
  className?: string
}

export function ESGMetricDisplay({
  label,
  value,
  unit,
  category,
  trend,
  className
}: ESGMetricDisplayProps) {
  const getCategoryColor = () => {
    switch (category) {
      case 'environment':
      case 'sustainability':
      case 'circular':
        return "text-primary"
      case 'social':
        return "text-secondary"
      case 'governance':
        return "text-accent"
      default:
        return "text-foreground"
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <ESGIcon category={category} size="sm" />
      </div>
      <div className="flex items-baseline space-x-1">
        <span className={cn("text-2xl font-bold", getCategoryColor())}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
      {trend && (
        <div className="flex items-center space-x-1 text-xs">
          <TrendingUp className={cn(
            "h-3 w-3",
            trend.direction === "up" ? "text-success" :
            trend.direction === "down" ? "text-error" :
            "text-muted-foreground"
          )} />
          <span className={cn(
            trend.direction === "up" ? "text-success" :
            trend.direction === "down" ? "text-error" :
            "text-muted-foreground"
          )}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  )
} 