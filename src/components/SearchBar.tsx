'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Filter } from 'lucide-react'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (query: string) => void
  onLocationRequest?: () => void
  placeholder?: string
  className?: string
}

export function SearchBar({ 
  onSearch, 
  onLocationRequest, 
  placeholder = "Search for dishes...",
  className 
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery)
    }, 300),
    [onSearch]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          {onLocationRequest && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onLocationRequest}
              className="h-8 w-8 p-0"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  )
}
