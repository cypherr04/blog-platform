"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Loader2, Navigation } from "lucide-react"

interface LocationSuggestion {
  id: string
  display_name: string
  lat: string
  lon: string
  type: string
  country?: string
  city?: string
  state?: string
}

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export default function LocationInput({ value, onChange, disabled, placeholder, className }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounced search function
  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      await searchLocations(value)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [value])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchLocations = async (query: string) => {
    setIsLoading(true)
    try {
      // Using Nominatim (OpenStreetMap) API - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=5&addressdetails=1&extratags=1`,
      )

      if (response.ok) {
        const data = await response.json()
        const formattedSuggestions: LocationSuggestion[] = data.map((item: any) => ({
          id: item.place_id,
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          type: item.type,
          country: item.address?.country,
          city: item.address?.city || item.address?.town || item.address?.village,
          state: item.address?.state,
        }))

        setSuggestions(formattedSuggestions)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("Error searching locations:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    // Format the location nicely
    const parts = []
    if (suggestion.city) parts.push(suggestion.city)
    if (suggestion.state) parts.push(suggestion.state)
    if (suggestion.country) parts.push(suggestion.country)

    const formattedLocation = parts.length > 0 ? parts.join(", ") : suggestion.display_name

    onChange(formattedLocation)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setIsDetectingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Reverse geocoding to get location name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
          )

          if (response.ok) {
            const data = await response.json()
            const parts = []

            if (data.address?.city || data.address?.town || data.address?.village) {
              parts.push(data.address.city || data.address.town || data.address.village)
            }
            if (data.address?.state) parts.push(data.address.state)
            if (data.address?.country) parts.push(data.address.country)

            const detectedLocation = parts.length > 0 ? parts.join(", ") : data.display_name

            onChange(detectedLocation)
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error)
          alert("Could not determine your location name.")
        } finally {
          setIsDetectingLocation(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        let message = "Could not detect your location."

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable."
            break
          case error.TIMEOUT:
            message = "Location request timed out."
            break
        }

        alert(message)
        setIsDetectingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  const formatSuggestionDisplay = (suggestion: LocationSuggestion) => {
    const parts = []
    if (suggestion.city) parts.push(suggestion.city)
    if (suggestion.state) parts.push(suggestion.state)
    if (suggestion.country) parts.push(suggestion.country)

    return parts.length > 0 ? parts.join(", ") : suggestion.display_name
  }

  const getSuggestionType = (suggestion: LocationSuggestion) => {
    if (suggestion.type === "city" || suggestion.city) return "City"
    if (suggestion.type === "state" || suggestion.state) return "State"
    if (suggestion.type === "country" || suggestion.country) return "Country"
    return "Place"
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            disabled={disabled}
            placeholder={placeholder || "Enter your location..."}
            className="pr-8"
          />
          {isLoading && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={detectCurrentLocation}
          disabled={disabled || isDetectingLocation}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {isDetectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          {isDetectingLocation ? "Detecting..." : "Use Current"}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-3 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{formatSuggestionDisplay(suggestion)}</div>
                    {suggestion.display_name !== formatSuggestionDisplay(suggestion) && (
                      <div className="text-xs text-muted-foreground truncate">{suggestion.display_name}</div>
                    )}
                  </div>
                </div>
                <Badge className="text-xs bg-secondary text-secondary-foreground">
                  {getSuggestionType(suggestion)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popular Locations Quick Select */}
      {!value && !showSuggestions && (
        <div className="mt-2">
          <div className="text-xs text-muted-foreground mb-2">Popular locations:</div>
          <div className="flex flex-wrap gap-1">
            {[
              "New York, NY, USA",
              "London, England, UK",
              "Tokyo, Japan",
              "Paris, France",
              "Berlin, Germany",
              "Sydney, Australia",
            ].map((location) => (
              <Badge
                key={location}
                className="cursor-pointer text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80"
                onClick={() => onChange(location)}
              >
                {location}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
