import mongoose, { Schema, type Document, models, type Model } from "mongoose"
import type { IUser } from "./user"
import type { ISwapRequest } from "./swap-request"

export interface IMessage extends Document {
  swapId: ISwapRequest["_id"]
  sender: IUser["_id"]
  receiver: IUser["_id"]
  content: string
}

const MessageSchema: Schema = new Schema(
  {
    swapId: { type: Schema.Types.ObjectId, ref: "SwapRequest", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
)

const Message: Model<IMessage> = models.Message || mongoose.model<IMessage>("Message", MessageSchema)
export default Message
