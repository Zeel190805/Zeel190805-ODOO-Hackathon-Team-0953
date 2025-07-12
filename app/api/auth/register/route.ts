import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/user"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    await dbConnect()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return new NextResponse("Email already in use", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      hashedPassword,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
