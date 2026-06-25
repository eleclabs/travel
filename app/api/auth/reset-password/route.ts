import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators";
import { resetPassword } from "@/services/auth.service";
import { notifyPasswordReset } from "@/services/mail.service";

export async function POST(request: Request) {
  try {
    const { token, password } = resetPasswordSchema.parse(
      await request.json()
    );
    const user = await resetPassword(token, password);
    await notifyPasswordReset(user);

    return NextResponse.json({
      success: true,
      message: "ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบ",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถตั้งรหัสผ่านใหม่ได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
