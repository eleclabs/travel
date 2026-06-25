import mongoose, { Schema, models } from "mongoose";

const ReportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: {
      type: String,
      enum: [
        "illegal_service",
        "harassment",
        "fraud",
        "fake_profile",
        "other",
      ],
      required: true,
    },
    details: { type: String, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved", "dismissed"],
      default: "open",
    },
  },
  { timestamps: true }
);

ReportSchema.index({ reporter: 1, reportedUser: 1, status: 1 });

export default models.Report || mongoose.model("Report", ReportSchema);
