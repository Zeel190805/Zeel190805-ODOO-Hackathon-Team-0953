import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import CourseEnrollment from "@/models/course-enrollment"
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

    const enrollments = await CourseEnrollment.find({
      $or: [{ student: user._id }, { instructor: user._id }],
    })
      .populate("student", "name email profileImage")
      .populate("instructor", "name email profileImage")
      .sort({ createdAt: -1 })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("[COURSE_ENROLLMENTS_GET_ERROR]", error)
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
    const { instructorId, courseName, courseDescription, skill } = body

    await dbConnect()

    const student = await User.findOne({ email: session.user.email })
    if (!student) {
      return new NextResponse("User not found", { status: 404 })
    }

    const instructor = await User.findById(instructorId)
    if (!instructor) {
      return new NextResponse("Instructor not found", { status: 404 })
    }

    // Check if enrollment already exists
    const existingEnrollment = await CourseEnrollment.findOne({
      student: student._id,
      instructor: instructorId,
      status: "active",
    })

    if (existingEnrollment) {
      return new NextResponse("Already enrolled in this course", { status: 400 })
    }

    const enrollment = await CourseEnrollment.create({
      student: student._id,
      instructor: instructorId,
      courseName,
      courseDescription,
      skill,
    })

    const populatedEnrollment = await CourseEnrollment.findById(enrollment._id)
      .populate("student", "name email profileImage")
      .populate("instructor", "name email profileImage")

    return NextResponse.json(populatedEnrollment)
  } catch (error) {
    console.error("[COURSE_ENROLLMENTS_POST_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 