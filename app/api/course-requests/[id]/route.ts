import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import CourseRequest from "@/models/course-request"
import CourseEnrollment from "@/models/course-enrollment"
import User from "@/models/user"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const courseRequest = await CourseRequest.findById(params.id)
      .populate("fromUser", "name email profileImage")
      .populate("toUser", "name email profileImage")

    if (!courseRequest) {
      return new NextResponse("Course request not found", { status: 404 })
    }

    // Check if the user is the recipient of the request
    if (courseRequest.toUser._id.toString() !== user._id.toString()) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Update the course request status
    courseRequest.status = status
    await courseRequest.save()

    // If accepted, create a course enrollment
    if (status === "accepted") {
      const enrollment = await CourseEnrollment.create({
        student: courseRequest.fromUser._id,
        instructor: courseRequest.toUser._id,
        courseName: courseRequest.courseName,
        courseDescription: courseRequest.courseDescription,
        skill: courseRequest.requestedSkill,
        status: "active",
      })

      // Populate the enrollment for response
      const populatedEnrollment = await CourseEnrollment.findById(enrollment._id)
        .populate("student", "name email profileImage")
        .populate("instructor", "name email profileImage")

      return NextResponse.json({ 
        courseRequest: courseRequest,
        enrollment: populatedEnrollment 
      })
    }

    return NextResponse.json(courseRequest)
  } catch (error) {
    console.error("[COURSE_REQUEST_PATCH_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 