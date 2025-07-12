"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Rating {
  _id: string
  fromUser: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  rating: number
  feedback: string
  skillContext?: string
  createdAt: string
}

interface UserRatingsProps {
  userId: string
  userName: string
}

export function UserRatings({ userId, userName }: UserRatingsProps) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRatings()
  }, [userId])

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setRatings(data)
      } else {
        throw new Error("Failed to fetch ratings")
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
      toast({
        title: "Error",
        description: "Failed to load ratings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ratings & Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratings & Feedback for {userName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {ratings.length} {ratings.length === 1 ? "rating" : "ratings"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No ratings yet. Be the first to rate this user!</p>
          </div>
        ) : (
          ratings.map((rating) => (
            <div key={rating._id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={rating.fromUser.profileImage || "/placeholder.svg"} />
                  <AvatarFallback>{rating.fromUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{rating.fromUser.name}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {rating.skillContext && (
                      <Badge variant="secondary" className="text-xs">
                        {rating.skillContext}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(rating.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm leading-relaxed">{rating.feedback}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
} 