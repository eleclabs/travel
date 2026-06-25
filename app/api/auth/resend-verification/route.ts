import { NextResponse } from "next/server";
import { requireMember } from "@/lib/access";
import { createEmailVerificationToken } from "@/services/auth.service";
import { sendVerificationEmail } from "@/services/mail.service";

export async function POST(request: Request) {
  try {
    const member = await requireMember();
    const result = await createEmailVerificationToken(member.id);
    const origin = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
    await sendVerificationEmail(
      result.email,
      `${origin}/verify-email/${result.token}`
    );
    return NextResponse.json({ success: true, message: "ส่งอีเมลยืนยันแล้ว" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถส่งอีเมลได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
