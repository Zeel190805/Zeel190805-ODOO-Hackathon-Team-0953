import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/user"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('profileImage') as File

    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse("Invalid file type. Only images are allowed.", { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new NextResponse("File too large. Maximum size is 5MB.", { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `profile-${user._id}-${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate public URL
    const publicUrl = `/uploads/${fileName}`

    // Update user profile with new image URL
    user.profileImage = publicUrl
    await user.save()

    return NextResponse.json({ 
      profileImage: publicUrl,
      message: "Profile image updated successfully" 
    })

  } catch (error) {
    console.error("[PROFILE_IMAGE_UPLOAD_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 