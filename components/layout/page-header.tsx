import React from "react"
import { LucideIcon } from "lucide-react"
import { ESGGradientBackground, ESGIcon, ESGCategory } from "@/components/ui/esg-theme"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  esgCategory?: ESGCategory
  className?: string
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  esgCategory,
  className,
  actions
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <ESGGradientBackground className="rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center shadow-lg">
              {esgCategory ? (
                <ESGIcon category={esgCategory} size="lg" className="text-white" />
              ) : Icon ? (
                <Icon className="h-6 w-6 text-white" />
              ) : (
                <div className="h-6 w-6 bg-white/30 rounded" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {description && (
                <p className="text-white/90 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </ESGGradientBackground>
    </div>
  )
} 