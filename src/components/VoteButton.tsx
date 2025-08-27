'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  dishId: string
  initialVotes: number
  className?: string
}

export function VoteButton({ dishId, initialVotes, className }: VoteButtonProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [isVoted, setIsVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dishId }),
      })

      if (response.ok) {
        if (!isVoted) {
          setVotes(prev => prev + 1)
          setIsVoted(true)
        } else {
          setVotes(prev => prev - 1)
          setIsVoted(false)
        }
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleVote}
      disabled={isLoading}
      className={cn(
        "h-8 w-8 p-0 hover:bg-red-50",
        isVoted && "text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-colors",
          isVoted && "fill-red-500"
        )} 
      />
    </Button>
  )
}
