import mongoose, { Schema, models } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 2000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default models.ChatMessage ||
  mongoose.model("ChatMessage", ChatMessageSchema);
