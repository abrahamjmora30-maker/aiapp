'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendBadgeProps {
  score: number
  className?: string
}

export function TrendBadge({ score, className }: TrendBadgeProps) {
  // Determine trend level based on score
  const getTrendLevel = (score: number) => {
    if (score > 10) return { level: 'hot', color: 'bg-red-500', icon: TrendingUp }
    if (score > 5) return { level: 'trending', color: 'bg-orange-500', icon: TrendingUp }
    if (score > 2) return { level: 'rising', color: 'bg-yellow-500', icon: TrendingUp }
    if (score > 0) return { level: 'new', color: 'bg-green-500', icon: TrendingUp }
    return { level: 'quiet', color: 'bg-gray-500', icon: TrendingDown }
  }

  const { level, color, icon: Icon } = getTrendLevel(score)

  if (score === 0) return null

  return (
    <Badge 
      className={cn(
        "text-white text-xs font-medium flex items-center gap-1",
        color,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {level}
    </Badge>
  )
}
