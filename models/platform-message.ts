import mongoose, { Schema, type Document, models, type Model } from "mongoose"

export interface IPlatformMessage extends Document {
  title: string
  content: string
  type: "info" | "warning" | "alert" | "update"
  isActive: boolean
  createdAt: Date
  createdBy: string
  expiresAt?: Date
}

const PlatformMessageSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "alert", "update"], default: "info" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true },
)

const PlatformMessage: Model<IPlatformMessage> = models.PlatformMessage || mongoose.model<IPlatformMessage>("PlatformMessage", PlatformMessageSchema)
export default PlatformMessage 