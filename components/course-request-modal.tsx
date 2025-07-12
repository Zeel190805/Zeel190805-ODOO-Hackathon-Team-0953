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

interface CourseRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetUser: IUser | null
  onSubmit: (data: { courseName: string; courseDescription: string; requestedSkill: string; message: string }) => void
}

export function CourseRequestModal({ open, onOpenChange, targetUser, onSubmit }: CourseRequestModalProps) {
  const [courseName, setCourseName] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [requestedSkill, setRequestedSkill] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseName || !courseDescription || !requestedSkill) return

    setIsSubmitting(true)
    try {
      await onSubmit({ courseName, courseDescription, requestedSkill, message })
      // Reset form
      setCourseName("")
      setCourseDescription("")
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
          <DialogTitle>Request Course</DialogTitle>
          <DialogDescription>
            Send a course request to {targetUser?.name}. Describe the course you'd like to learn from them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course-name">Course Name</Label>
              <Input
                id="course-name"
                placeholder="e.g., Advanced React Development"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-description">Course Description</Label>
              <Textarea
                id="course-description"
                placeholder="Describe what you want to learn in this course..."
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requested-skill">Skill to Learn</Label>
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
                placeholder="Tell them why you'd like to learn this course..."
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
            <Button type="submit" disabled={isSubmitting || !courseName || !courseDescription || !requestedSkill}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 