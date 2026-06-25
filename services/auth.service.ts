import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  await connectDB();

  const email = data.email.trim().toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) throw new Error("อีเมลนี้ถูกใช้งานแล้ว");

  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const user = await User.create({
    name: data.name.trim(),
    email,
    password: await bcrypt.hash(data.password, 10),
    role: "member",
    emailVerificationToken,
    emailVerificationExpire: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  return { email: user.email, token: emailVerificationToken };
}

export async function verifyEmail(token: string) {
  await connectDB();
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: new Date() },
  });
  if (!user) throw new Error("ลิงก์ยืนยันอีเมลหมดอายุหรือไม่ถูกต้อง");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();
  return { name: user.name, email: user.email };
}

export async function createEmailVerificationToken(userId: string) {
  await connectDB();
  const token = crypto.randomBytes(32).toString("hex");
  const user = await User.findByIdAndUpdate(
    userId,
    {
      emailVerificationToken: token,
      emailVerificationExpire: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
    { new: true }
  );
  if (!user) throw new Error("ไม่พบผู้ใช้");
  return { email: user.email, token };
}

export async function createResetToken(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) return null;

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpire = new Date(Date.now() + 1000 * 60 * 15);
  await user.save();
  return { token, name: user.name, email: user.email };
}

export async function resetPassword(token: string, password: string) {
  await connectDB();
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: new Date() },
  }).select("+password");
  if (!user) throw new Error("ลิงก์หมดอายุหรือไม่ถูกต้อง");

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpire = undefined;
  await user.save();
  return { name: user.name, email: user.email };
}
