import mongoose, { Schema, type Document, models, type Model } from "mongoose"

export interface IRating extends Document {
  fromUser: mongoose.Types.ObjectId
  toUser: mongoose.Types.ObjectId
  rating: number
  feedback: string
  skillContext?: string
  createdAt: Date
  updatedAt: Date
}

const RatingSchema: Schema = new Schema(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, required: true, maxlength: 1000 },
    skillContext: { type: String },
  },
  { timestamps: true },
)

// Ensure a user can only rate another user once
RatingSchema.index({ fromUser: 1, toUser: 1 }, { unique: true })

const Rating: Model<IRating> = models.Rating || mongoose.model<IRating>("Rating", RatingSchema)
export default Rating 