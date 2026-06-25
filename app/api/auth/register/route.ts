import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";
import { registerUser } from "@/services/auth.service";
import {
  notifyAdminNewRegistration,
  sendVerificationEmail,
} from "@/services/mail.service";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const result = await registerUser(body);
    const origin = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
    let emailSent = true;
    try {
      await Promise.all([
        sendVerificationEmail(
          result.email,
          `${origin}/verify-email/${result.token}`
        ),
        notifyAdminNewRegistration({
          name: body.name,
          email: result.email,
        }),
      ]);
    } catch {
      emailSent = false;
    }
    return NextResponse.json({
      success: true,
      message: emailSent
        ? "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี"
        : "สมัครสมาชิกสำเร็จ แต่ส่งอีเมลไม่สำเร็จ คุณสามารถส่งอีเมลยืนยันใหม่จากหน้าโปรไฟล์",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถสมัครสมาชิกได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
