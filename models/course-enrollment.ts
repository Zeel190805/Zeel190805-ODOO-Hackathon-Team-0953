import mongoose, { Schema, type Document, models, type Model } from "mongoose"
import type { IUser } from "./user"

export interface ICourseEnrollment extends Document {
  student: IUser["_id"]
  instructor: IUser["_id"]
  courseName: string
  courseDescription: string
  skill: string
  status: "active" | "completed" | "cancelled"
  startDate: Date
  endDate?: Date
  progress: number // 0-100
  feedback?: {
    rating: number
    comment: string
    from: IUser["_id"]
  }
}

const CourseEnrollmentSchema: Schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseName: { type: String, required: true },
    courseDescription: { type: String, required: true },
    skill: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      from: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true },
)

const CourseEnrollment: Model<ICourseEnrollment> =
  models.CourseEnrollment || mongoose.model<ICourseEnrollment>("CourseEnrollment", CourseEnrollmentSchema)

export default CourseEnrollment 