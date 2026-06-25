import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { assertLegalProfileContent } from "@/lib/content-policy";
import User from "@/models/User";
import Report from "@/models/Report";

export type PublicProfile = {
  id: string;
  profileImage: string;
  nickname: string;
  age: number;
  province: string;
  profileType: string;
  skills: string[];
  bio: string;
  isOpenToWork: boolean;
};

function toPublicProfile(user: Record<string, unknown>): PublicProfile {
  return {
    id: String(user._id),
    profileImage: String(user.profileImage ?? ""),
    nickname: String(user.nickname ?? ""),
    age: Number(user.age ?? 0),
    province: String(user.province ?? ""),
    profileType: String(user.profileType ?? "chat_friend"),
    skills: Array.isArray(user.skills) ? user.skills.map(String) : [],
    bio: String(user.bio ?? ""),
    isOpenToWork: Boolean(user.isOpenToWork),
  };
}

export async function getOwnProfile(userId: string) {
  await connectDB();
  const user = await User.findById(userId)
    .select(
      "name email profileImage nickname age province profileType skills bio isOpenToWork isEmailVerified moderationStatus moderationNote"
    )
    .lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profileImage: user.profileImage ?? "",
    nickname: user.nickname ?? "",
    age: user.age ?? "",
    province: user.province ?? "",
    profileType: user.profileType ?? "chat_friend",
    skills: user.skills ?? [],
    bio: user.bio ?? "",
    isOpenToWork: Boolean(user.isOpenToWork),
    isEmailVerified: user.isEmailVerified !== false,
    moderationStatus: user.moderationStatus ?? "draft",
    moderationNote: user.moderationNote ?? "",
  };
}

export async function updateOwnProfile(
  userId: string,
  data: {
    profileImage: string;
    nickname: string;
    age: number;
    province: string;
    profileType: string;
    skills: string[];
    bio: string;
    isOpenToWork: boolean;
  }
) {
  assertLegalProfileContent([data.nickname, data.bio, ...data.skills]);
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error("ไม่พบผู้ใช้");
  if (user.isEmailVerified === false) {
    throw new Error("กรุณายืนยันอีเมลก่อนส่งโปรไฟล์ให้ตรวจสอบ");
  }

  Object.assign(user, data, {
    moderationStatus: "pending",
    moderationNote: "",
  });
  await user.save();
}

export async function clearOwnProfile(userId: string) {
  await connectDB();
  await User.findByIdAndUpdate(userId, {
    profileImage: "",
    nickname: "",
    age: null,
    province: "",
    profileType: "chat_friend",
    skills: [],
    bio: "",
    isOpenToWork: false,
    moderationStatus: "draft",
    moderationNote: "",
  });
}

export async function getPublicProfiles(viewerId?: string) {
  await connectDB();
  let excludedIds: mongoose.Types.ObjectId[] = [];

  if (viewerId && mongoose.isValidObjectId(viewerId)) {
    const viewer = await User.findById(viewerId).select("blockedUsers").lean();
    const blockedByOthers = await User.find({ blockedUsers: viewerId })
      .select("_id")
      .lean();
    excludedIds = [
      ...(viewer?.blockedUsers ?? []),
      ...blockedByOthers.map((item) => item._id),
      new mongoose.Types.ObjectId(viewerId),
    ];
  }

  const users = await User.find({
    isActive: true,
    moderationStatus: "approved",
    ...(excludedIds.length ? { _id: { $nin: excludedIds } } : {}),
  })
    .select(
      "profileImage nickname age province profileType skills bio isOpenToWork"
    )
    .sort({ updatedAt: -1 })
    .lean();

  return users.map((user) => toPublicProfile(user as Record<string, unknown>));
}

export async function getPublicProfile(id: string, viewerId?: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();

  if (viewerId && mongoose.isValidObjectId(viewerId)) {
    const blocked = await User.exists({
      $or: [
        { _id: viewerId, blockedUsers: id },
        { _id: id, blockedUsers: viewerId },
      ],
    });
    if (blocked) return null;
  }

  const user = await User.findOne({
    _id: id,
    isActive: true,
    moderationStatus: "approved",
  })
    .select(
      "profileImage nickname age province profileType skills bio isOpenToWork"
    )
    .lean();
  return user ? toPublicProfile(user as Record<string, unknown>) : null;
}

export async function blockUser(userId: string, targetId: string) {
  if (userId === targetId || !mongoose.isValidObjectId(targetId)) {
    throw new Error("ไม่สามารถบล็อกผู้ใช้นี้ได้");
  }
  await connectDB();
  await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: targetId } });
}

export async function unblockUser(userId: string, targetId: string) {
  await connectDB();
  await User.findByIdAndUpdate(userId, { $pull: { blockedUsers: targetId } });
}

export async function reportUser(
  reporterId: string,
  data: { reportedUserId: string; reason: string; details: string }
) {
  if (reporterId === data.reportedUserId) {
    throw new Error("ไม่สามารถรายงานตัวเองได้");
  }
  await connectDB();
  const target = await User.exists({ _id: data.reportedUserId });
  if (!target) throw new Error("ไม่พบผู้ใช้ที่ต้องการรายงาน");

  await Report.create({
    reporter: reporterId,
    reportedUser: data.reportedUserId,
    reason: data.reason,
    details: data.details,
  });
}

export async function getAdminReviewData() {
  await connectDB();
  const [users, reports] = await Promise.all([
    User.find({ moderationStatus: { $in: ["pending", "rejected"] } })
      .select(
        "email profileImage nickname age province profileType skills bio isOpenToWork isEmailVerified moderationStatus moderationNote isActive"
      )
      .sort({ updatedAt: -1 })
      .lean(),
    Report.find({ status: { $in: ["open", "reviewing"] } })
      .populate("reporter", "nickname email")
      .populate("reportedUser", "nickname email")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return {
    users: users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      profileImage: user.profileImage ?? "",
      nickname: user.nickname ?? "",
      age: user.age ?? 0,
      province: user.province ?? "",
      profileType: user.profileType ?? "chat_friend",
      skills: user.skills ?? [],
      bio: user.bio ?? "",
      isOpenToWork: Boolean(user.isOpenToWork),
      isEmailVerified: user.isEmailVerified !== false,
      moderationStatus: user.moderationStatus ?? "pending",
      moderationNote: user.moderationNote ?? "",
      isActive: user.isActive !== false,
    })),
    reports: reports.map((report) => ({
      id: report._id.toString(),
      reporter:
        typeof report.reporter === "object" && report.reporter
          ? String((report.reporter as { nickname?: string; email?: string }).nickname || (report.reporter as { email?: string }).email || "สมาชิก")
          : "สมาชิก",
      reportedUser:
        typeof report.reportedUser === "object" && report.reportedUser
          ? String((report.reportedUser as { nickname?: string; email?: string }).nickname || (report.reportedUser as { email?: string }).email || "สมาชิก")
          : "สมาชิก",
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: report.createdAt,
    })),
  };
}

export async function resolveReport(
  reportId: string,
  status: "resolved" | "dismissed"
) {
  await connectDB();
  const report = await Report.findByIdAndUpdate(reportId, { status });
  if (!report) throw new Error("ไม่พบรายงาน");
}

export async function moderateProfile(
  userId: string,
  data: { status: "approved" | "rejected"; note: string }
) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error("ไม่พบผู้ใช้");
  user.moderationStatus = data.status;
  user.moderationNote = data.note;
  await user.save();
}
