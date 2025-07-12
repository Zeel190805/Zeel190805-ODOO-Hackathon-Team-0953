import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import dbConnect from "@/lib/mongodb"
import User from "@/models/user"

export async function GET() {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) {
      return new NextResponse(adminCheck.error, { status: adminCheck.status })
    }

    await dbConnect()

    const users = await User.find({})
      .select("-hashedPassword")
      .sort({ createdAt: -1 })

    return NextResponse.json(users)
  } catch (error) {
    console.error("[ADMIN_USERS_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) {
      return new NextResponse(adminCheck.error, { status: adminCheck.status })
    }

    const { userId, action, reason } = await request.json()

    if (!userId || !action) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    await dbConnect()

    const user = await User.findById(userId)
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (action === "ban") {
      user.isBanned = true
      user.banReason = reason || "Violation of platform policies"
      user.bannedAt = new Date()
      user.bannedBy = adminCheck.user.email
    } else if (action === "unban") {
      user.isBanned = false
      user.banReason = undefined
      user.bannedAt = undefined
      user.bannedBy = undefined
    } else if (action === "makeAdmin") {
      user.role = "admin"
    } else if (action === "removeAdmin") {
      user.role = "user"
    } else {
      return new NextResponse("Invalid action", { status: 400 })
    }

    await user.save()

    const updatedUser = await User.findById(userId).select("-hashedPassword")
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[ADMIN_USERS_PUT_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 