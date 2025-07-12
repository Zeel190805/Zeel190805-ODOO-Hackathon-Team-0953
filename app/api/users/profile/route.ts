import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await dbConnect()
    const user = await User.findOne({ email: session.user.email }).select("-hashedPassword")

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[PROFILE_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, location, availability, skillsOffered, skillsWanted, isProfilePublic } = body

    await dbConnect()

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        name,
        location,
        availability,
        skillsOffered: skillsOffered || [],
        skillsWanted: skillsWanted || [],
        isProfilePublic: isProfilePublic !== undefined ? isProfilePublic : true,
      },
      { new: true, runValidators: true },
    ).select("-hashedPassword")

    if (!updatedUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
