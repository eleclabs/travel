import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { createResetToken } from "@/services/auth.service";
import {
  notifyAdminForgotPassword,
  sendResetPasswordEmail,
} from "@/services/mail.service";

export async function POST(request: Request) {
  try {
    const { email } = forgotPasswordSchema.parse(await request.json());
    const result = await createResetToken(email);

    if (result) {
      const origin = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
      await Promise.allSettled([
        sendResetPasswordEmail(
          result.email,
          `${origin}/reset-password/${result.token}`
        ),
        notifyAdminForgotPassword(result.email),
      ]);
    }

    return NextResponse.json({
      success: true,
      message: "หากอีเมลนี้อยู่ในระบบ เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่ให้แล้ว",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถดำเนินการได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
