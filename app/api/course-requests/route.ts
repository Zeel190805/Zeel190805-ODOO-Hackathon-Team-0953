import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import CourseRequest from "@/models/course-request"
import User from "@/models/user"

export async function GET() {
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

    const courseRequests = await CourseRequest.find({
      $or: [{ fromUser: user._id }, { toUser: user._id }],
    })
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")
      .sort({ createdAt: -1 })

    return NextResponse.json(courseRequests)
  } catch (error) {
    console.error("[COURSE_REQUESTS_GET_ERROR]", error)
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
    const { toUserId, courseName, courseDescription, requestedSkill, message } = body

    await dbConnect()

    const fromUser = await User.findOne({ email: session.user.email })
    if (!fromUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    const toUser = await User.findById(toUserId)
    if (!toUser) {
      return new NextResponse("Target user not found", { status: 404 })
    }

    // Check if a similar request already exists
    const existingRequest = await CourseRequest.findOne({
      fromUser: fromUser._id,
      toUser: toUserId,
      status: { $in: ["pending", "accepted"] },
    })

    if (existingRequest) {
      return new NextResponse("Request already exists", { status: 400 })
    }

    const courseRequest = await CourseRequest.create({
      fromUser: fromUser._id,
      toUser: toUserId,
      courseName,
      courseDescription,
      requestedSkill,
      message,
    })

    const populatedRequest = await CourseRequest.findById(courseRequest._id)
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")

    return NextResponse.json(populatedRequest)
  } catch (error) {
    console.error("[COURSE_REQUESTS_POST_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 