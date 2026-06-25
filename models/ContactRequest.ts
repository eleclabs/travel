import mongoose, { Schema, models } from "mongoose";

const ContactRequestSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ContactRequestSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default models.ContactRequest ||
  mongoose.model("ContactRequest", ContactRequestSchema);
