"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, Camera } from "lucide-react"

interface ProfilePictureUploadProps {
  currentImage?: string
  onImageUpdate: (imageUrl: string) => void
  userName: string
  userEmail: string
}

export function ProfilePictureUpload({ 
  currentImage, 
  onImageUpdate, 
  userName, 
  userEmail 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFile = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await fetch('/api/users/profile-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onImageUpdate(data.profileImage)
        toast({
          title: "Success",
          description: "Profile picture updated successfully!",
        })
      } else {
        const error = await response.text()
        throw new Error(error || 'Failed to upload image')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      })
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = previewUrl || currentImage || `https://avatar.vercel.sh/${userEmail}.png`

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={displayImage} />
          <AvatarFallback>{userName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Change Photo"}
          </Button>
          {previewUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeImage}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop an image here, or click to select
        </p>
        <p className="text-xs text-muted-foreground">
          Supports: JPEG, PNG, GIF (max 5MB)
        </p>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
} 