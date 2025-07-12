import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import SwapRequest from "@/models/swap-request"
import User from "@/models/user"

export async function PUT(request: Request, context: { params: { id: string } }) {
  const { params } = await context;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { status, feedback } = body

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const swapRequest = await SwapRequest.findById(params.id)
    if (!swapRequest) {
      return new NextResponse("Swap request not found", { status: 404 })
    }

    // Check if user is authorized to update this request
    const isToUser = swapRequest.toUser.toString() === user._id.toString()
    const isFromUser = swapRequest.fromUser.toString() === user._id.toString()

    if (!isToUser && !isFromUser) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Update the request
    const updateData: any = {}

    if (status && (status === "accepted" || status === "rejected") && isToUser) {
      updateData.status = status
    } else if (status === "completed" && (isToUser || isFromUser)) {
      updateData.status = status
    } else if (status === "cancelled" && isFromUser) {
      updateData.status = status
    }

    if (feedback && status === "completed") {
      updateData.feedback = {
        ...feedback,
        from: user._id,
      }
    }

    const updatedRequest = await SwapRequest.findByIdAndUpdate(params.id, updateData, { new: true })
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("[SWAP_UPDATE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { params } = await context;
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

    const swapRequest = await SwapRequest.findById(params.id)
    if (!swapRequest) {
      return new NextResponse("Swap request not found", { status: 404 })
    }

    // Check if user is authorized to delete this request
    const isFromUser = swapRequest.fromUser.toString() === user._id.toString()

    if (!isFromUser) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    await SwapRequest.findByIdAndDelete(params.id)

    return new NextResponse("Request deleted", { status: 200 })
  } catch (error) {
    console.error("[SWAP_DELETE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { params } = await context;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    const swapRequest = await SwapRequest.findById(params.id)
    if (!swapRequest) {
      return new NextResponse("Swap request not found", { status: 404 })
    }

    // Check if the current user is the recipient of the request
    if (swapRequest.toUser.toString() !== user._id.toString()) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Update the request status
    const updatedRequest = await SwapRequest.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    )
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("[SWAP_UPDATE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
