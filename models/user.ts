import mongoose, { Schema, type Document, models, type Model } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  hashedPassword?: string
  location?: string
  availability?: string
  profileImage?: string
  skillsOffered: string[]
  skillsWanted: string[]
  isProfilePublic: boolean
  socketId?: string
  rating: {
    average: number
    count: number
  }
  role: "user" | "admin"
  isBanned: boolean
  banReason?: string
  bannedAt?: Date
  bannedBy?: string
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    location: { type: String },
    availability: { type: String },
    profileImage: { type: String, default: "/placeholder.svg?height=100&width=100" },
    skillsOffered: [{ type: String }],
    skillsWanted: [{ type: String }],
    isProfilePublic: { type: Boolean, default: true },
    socketId: { type: String },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
    bannedAt: { type: Date },
    bannedBy: { type: String },
  },
  { timestamps: true },
)

const User: Model<IUser> = models.User || mongoose.model<IUser>("User", UserSchema)
export default User
