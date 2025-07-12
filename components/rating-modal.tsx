"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RatingModalProps {
  user: {
    _id: string
    name: string
    email: string
    profileImage?: string
  }
  trigger?: React.ReactNode
}

export function RatingModal({ user, trigger }: RatingModalProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [skillContext, setSkillContext] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      })
      return
    }

    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: user._id,
          rating,
          feedback: feedback.trim(),
          skillContext: skillContext.trim() || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Rating Submitted",
          description: "Thank you for your feedback!",
        })
        setOpen(false)
        setRating(0)
        setFeedback("")
        setSkillContext("")
      } else {
        const error = await response.text()
        throw new Error(error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setRating(0)
    setFeedback("")
    setSkillContext("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Rate User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate {user.name}</DialogTitle>
          <DialogDescription>
            Share your experience with this user. Your feedback helps the community.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profileImage || "/placeholder.svg"} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Skill Context */}
          <div className="space-y-2">
            <Label htmlFor="skillContext">Skill Context (Optional)</Label>
            <Input
              id="skillContext"
              placeholder="e.g., JavaScript, Cooking, Photography"
              value={skillContext}
              onChange={(e) => setSkillContext(e.target.value)}
            />
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback *</Label>
            <Textarea
              id="feedback"
              placeholder="Share your experience with this user..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-sm text-muted-foreground">
              {feedback.length}/1000 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 