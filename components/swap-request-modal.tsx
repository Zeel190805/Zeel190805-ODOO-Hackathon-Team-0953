"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IUser } from "@/models/user"

interface SwapRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetUser: IUser | null
  onSubmit: (data: { offeredSkill: string; requestedSkill: string; message: string }) => void
}

export function SwapRequestModal({ open, onOpenChange, targetUser, onSubmit }: SwapRequestModalProps) {
  const [offeredSkill, setOfferedSkill] = useState("")
  const [requestedSkill, setRequestedSkill] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offeredSkill || !requestedSkill) return

    setIsSubmitting(true)
    try {
      await onSubmit({ offeredSkill, requestedSkill, message })
      // Reset form
      setOfferedSkill("")
      setRequestedSkill("")
      setMessage("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Skill Swap</DialogTitle>
          <DialogDescription>
            Send a swap request to {targetUser?.name}. Choose what skill you'll offer and what you'd like to learn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="offered-skill">Skill You'll Offer</Label>
              <Input
                id="offered-skill"
                placeholder="e.g., React, Python, Design"
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requested-skill">Skill You Want to Learn</Label>
              <Select value={requestedSkill} onValueChange={setRequestedSkill} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill they offer" />
                </SelectTrigger>
                <SelectContent>
                  {targetUser?.skillsOffered.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell them why you'd like to swap skills..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !offeredSkill || !requestedSkill}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
