import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/mongodb"
import Rating from "@/models/rating"
import User from "@/models/user"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 })
    }

    await dbConnect()

    const ratings = await Rating.find({ toUser: userId })
      .populate("fromUser", "name email profileImage")
      .sort({ createdAt: -1 })

    return NextResponse.json(ratings)
  } catch (error) {
    console.error("[RATINGS_GET_ERROR]", error)
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
    const { toUserId, rating, feedback, skillContext } = body

    if (!toUserId || !rating || !feedback) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return new NextResponse("Rating must be between 1 and 5", { status: 400 })
    }

    await dbConnect()

    // Get the current user's ID
    const fromUser = await User.findOne({ email: session.user.email })
    if (!fromUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Check if user is trying to rate themselves
    if (fromUser._id.toString() === toUserId) {
      return new NextResponse("Cannot rate yourself", { status: 400 })
    }

    // Check if the target user exists
    const toUser = await User.findById(toUserId)
    if (!toUser) {
      return new NextResponse("Target user not found", { status: 404 })
    }

    // Check if user has already rated this person
    const existingRating = await Rating.findOne({
      fromUser: fromUser._id,
      toUser: toUserId,
    })

    if (existingRating) {
      return new NextResponse("You have already rated this user", { status: 400 })
    }

    // Create the rating
    const newRating = await Rating.create({
      fromUser: fromUser._id,
      toUser: toUserId,
      rating,
      feedback,
      skillContext,
    })

    // Update the user's average rating
    const allRatings = await Rating.find({ toUser: toUserId })
    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = totalRating / allRatings.length

    await User.findByIdAndUpdate(toUserId, {
      "rating.average": Math.round(averageRating * 10) / 10,
      "rating.count": allRatings.length,
    })

    const populatedRating = await Rating.findById(newRating._id)
      .populate("fromUser", "name email profileImage")

    return NextResponse.json(populatedRating)
  } catch (error) {
    console.error("[RATING_CREATE_ERROR]", error)
    if (error.code === 11000) {
      return new NextResponse("You have already rated this user", { status: 400 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
} 