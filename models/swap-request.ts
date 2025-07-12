import mongoose, { Schema, type Document, models, type Model } from "mongoose"
import type { IUser } from "./user"

export interface ISwapRequest extends Document {
  fromUser: IUser["_id"]
  toUser: IUser["_id"]
  offeredSkill: string
  requestedSkill: string
  message: string
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  feedback?: {
    rating: number
    comment: string
    from: IUser["_id"]
  }
}

const SwapRequestSchema: Schema = new Schema(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    offeredSkill: { type: String, required: true },
    requestedSkill: { type: String, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      from: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true },
)

const SwapRequest: Model<ISwapRequest> =
  models.SwapRequest || mongoose.model<ISwapRequest>("SwapRequest", SwapRequestSchema)
export default SwapRequest
