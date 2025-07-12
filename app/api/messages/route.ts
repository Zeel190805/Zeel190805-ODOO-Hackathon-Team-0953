import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Message from "@/models/message"
import User from "@/models/user"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const swapId = searchParams.get("swapId")

    if (!swapId) {
      return new NextResponse("Swap ID required", { status: 400 })
    }

    await dbConnect()

    const messages = await Message.find({ swapId }).populate("sender", "name email profileImage").sort({ createdAt: 1 })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("[MESSAGES_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { swapId, content, receiverId } = body

    await dbConnect()

    const sender = await User.findOne({ email: session.user.email })
    if (!sender) {
      return new NextResponse("User not found", { status: 404 })
    }

    const message = await Message.create({
      swapId,
      sender: sender._id,
      receiver: receiverId,
      content,
    })

    const populatedMessage = await Message.findById(message._id).populate("sender", "name email profileImage")

    return NextResponse.json(populatedMessage)
  } catch (error) {
    console.error("[MESSAGES_POST_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
