import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import dbConnect from "./mongodb"
import User from "@/models/user"
import { NextResponse } from "next/server"

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 }
  }

  await dbConnect()
  
  const user = await User.findOne({ email: session.user.email })
  
  if (!user || user.role !== "admin") {
    return { error: "Forbidden - Admin access required", status: 403 }
  }

  return { user }
} 