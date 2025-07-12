import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import dbConnect from "@/lib/mongodb"
import PlatformMessage from "@/models/platform-message"

export async function GET() {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) {
      return new NextResponse(adminCheck.error, { status: adminCheck.status })
    }

    await dbConnect()

    const messages = await PlatformMessage.find({})
      .sort({ createdAt: -1 })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("[ADMIN_MESSAGES_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) {
      return new NextResponse(adminCheck.error, { status: adminCheck.status })
    }

    const { title, content, type, expiresAt } = await request.json()

    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    await dbConnect()

    const message = new PlatformMessage({
      title,
      content,
      type: type || "info",
      createdBy: adminCheck.user.email,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    await message.save()

    return NextResponse.json(message)
  } catch (error) {
    console.error("[ADMIN_MESSAGES_POST_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) {
      return new NextResponse(adminCheck.error, { status: adminCheck.status })
    }

    const { messageId, isActive } = await request.json()

    if (!messageId) {
      return new NextResponse("Missing message ID", { status: 400 })
    }

    await dbConnect()

    const message = await PlatformMessage.findById(messageId)
    if (!message) {
      return new NextResponse("Message not found", { status: 404 })
    }

    if (typeof isActive === "boolean") {
      message.isActive = isActive
    }

    await message.save()

    return NextResponse.json(message)
  } catch (error) {
    console.error("[ADMIN_MESSAGES_PUT_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) {
      return new NextResponse(adminCheck.error, { status: adminCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get("id")

    if (!messageId) {
      return new NextResponse("Missing message ID", { status: 400 })
    }

    await dbConnect()

    const message = await PlatformMessage.findByIdAndDelete(messageId)
    if (!message) {
      return new NextResponse("Message not found", { status: 404 })
    }

    return NextResponse.json({ message: "Message deleted successfully" })
  } catch (error) {
    console.error("[ADMIN_MESSAGES_DELETE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 