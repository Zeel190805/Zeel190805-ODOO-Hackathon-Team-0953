import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import dbConnect from "@/lib/mongodb"
import User from "@/models/user"
import SwapRequest from "@/models/swap-request"
import CourseRequest from "@/models/course-request"
import CourseEnrollment from "@/models/course-enrollment"
import PlatformMessage from "@/models/platform-message"

export async function GET() {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.error) {
      return new NextResponse(adminCheck.error, { status: adminCheck.status })
    }

    await dbConnect()

    // Get user statistics
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isBanned: false })
    const bannedUsers = await User.countDocuments({ isBanned: true })
    const adminUsers = await User.countDocuments({ role: "admin" })

    // Get swap request statistics
    const totalSwaps = await SwapRequest.countDocuments()
    const pendingSwaps = await SwapRequest.countDocuments({ status: "pending" })
    const acceptedSwaps = await SwapRequest.countDocuments({ status: "accepted" })
    const completedSwaps = await SwapRequest.countDocuments({ status: "completed" })
    const cancelledSwaps = await SwapRequest.countDocuments({ status: "cancelled" })

    // Get course request statistics
    const totalCourseRequests = await CourseRequest.countDocuments()
    const pendingCourseRequests = await CourseRequest.countDocuments({ status: "pending" })
    const acceptedCourseRequests = await CourseRequest.countDocuments({ status: "accepted" })
    const completedCourseRequests = await CourseRequest.countDocuments({ status: "completed" })
    const cancelledCourseRequests = await CourseRequest.countDocuments({ status: "cancelled" })

    // Get course enrollment statistics
    const totalEnrollments = await CourseEnrollment.countDocuments()
    const activeEnrollments = await CourseEnrollment.countDocuments({ status: "active" })
    const completedEnrollments = await CourseEnrollment.countDocuments({ status: "completed" })

    // Get platform message statistics
    const totalMessages = await PlatformMessage.countDocuments()
    const activeMessages = await PlatformMessage.countDocuments({ isActive: true })

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    const recentSwaps = await SwapRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    const recentCourseRequests = await CourseRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    const recentEnrollments = await CourseEnrollment.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    })

    // Get top skills
    const users = await User.find({})
    const skillCounts: { [key: string]: number } = {}
    
    users.forEach(user => {
      user.skillsOffered.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      })
    })

    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }))

    const report = {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        admins: adminUsers,
        recent: recentUsers
      },
      swaps: {
        total: totalSwaps,
        pending: pendingSwaps,
        accepted: acceptedSwaps,
        completed: completedSwaps,
        cancelled: cancelledSwaps,
        recent: recentSwaps
      },
      courseRequests: {
        total: totalCourseRequests,
        pending: pendingCourseRequests,
        accepted: acceptedCourseRequests,
        completed: completedCourseRequests,
        cancelled: cancelledCourseRequests,
        recent: recentCourseRequests
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
        recent: recentEnrollments
      },
      messages: {
        total: totalMessages,
        active: activeMessages
      },
      topSkills,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("[ADMIN_REPORTS_GET_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 