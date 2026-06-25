import mongoose, { Schema, models } from "mongoose";

export const PROFILE_TYPES = [
  "job_seeker",
  "employer",
  "travel_friend",
  "chat_friend",
] as const;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["member", "admin", "user"],
      default: "member",
    },
    profileImage: { type: String, default: "" },
    nickname: { type: String, default: "", trim: true },
    age: { type: Number, min: 18, max: 100 },
    province: { type: String, default: "", trim: true },
    profileType: {
      type: String,
      enum: PROFILE_TYPES,
      default: "chat_friend",
    },
    skills: { type: [String], default: [] },
    bio: { type: String, default: "", maxlength: 1000 },
    isOpenToWork: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    moderationStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    moderationNote: { type: String, default: "" },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    resetToken: String,
    resetTokenExpire: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
