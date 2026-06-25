import { z } from "zod";
import { PROFILE_TYPES } from "@/models/User";

const password = z
  .string()
  .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
  .regex(/[A-Za-z]/, "รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว")
  .regex(/[0-9]/, "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร"),
  email: z.email("รูปแบบอีเมลไม่ถูกต้อง").trim().toLowerCase(),
  password,
});

export const forgotPasswordSchema = z.object({
  email: z.email("รูปแบบอีเมลไม่ถูกต้อง").trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "ไม่พบโทเคนสำหรับเปลี่ยนรหัสผ่าน"),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  profileImage: z
    .string()
    .max(2_000_000, "รูปภาพมีขนาดใหญ่เกินไป")
    .refine(
      (value) => !value || /^data:image\/(jpeg|png|webp);base64,/.test(value),
      "รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP"
    ),
  nickname: z.string().trim().min(2, "ชื่อเล่นต้องมีอย่างน้อย 2 ตัวอักษร").max(50),
  age: z.coerce.number().int().min(18, "ผู้ใช้ต้องมีอายุอย่างน้อย 18 ปี").max(100),
  province: z.string().trim().min(2, "กรุณาระบุจังหวัด").max(100),
  profileType: z.enum(PROFILE_TYPES),
  skills: z.array(z.string().trim().min(1).max(50)).max(20),
  bio: z.string().trim().min(10, "กรุณาแนะนำตัวอย่างน้อย 10 ตัวอักษร").max(1000),
  isOpenToWork: z.boolean(),
});

export const reportSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.enum([
    "illegal_service",
    "harassment",
    "fraud",
    "fake_profile",
    "other",
  ]),
  details: z.string().trim().max(500).default(""),
});

export const moderationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(500).default(""),
});

export const contactRequestSchema = z.object({
  receiverId: z.string().min(1, "ไม่พบผู้รับ"),
  message: z
    .string()
    .trim()
    .min(5, "ข้อความต้องมีอย่างน้อย 5 ตัวอักษร")
    .max(500, "ข้อความยาวเกิน 500 ตัวอักษร"),
});

export const chatMessageSchema = z.object({
  receiverId: z.string().min(1, "ไม่พบผู้รับ"),
  message: z
    .string()
    .trim()
    .min(1, "กรุณากรอกข้อความ")
    .max(2000, "ข้อความยาวเกิน 2,000 ตัวอักษร"),
});
