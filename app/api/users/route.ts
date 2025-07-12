import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    await dbConnect()

    // Fetch all public users
    let query: any = { isProfilePublic: true }
    
    // If user is authenticated, exclude them from the results
    if (session?.user?.email) {
      query = {
        ...query,
        email: { $ne: session.user.email }
      }
    }

    const users = await User.find(query)
      .select("-hashedPassword")
      .sort({ createdAt: -1 })

    return NextResponse.json(users)
  } catch (error) {
    console.error("[USERS_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 