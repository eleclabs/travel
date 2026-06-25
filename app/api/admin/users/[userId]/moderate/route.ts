import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/access";
import { moderationSchema } from "@/lib/validators";
import { moderateProfile } from "@/services/user.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await params;
    const data = moderationSchema.parse(await request.json());
    await moderateProfile(userId, data);
    return NextResponse.json({ success: true, message: "อัปเดตสถานะแล้ว" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถตรวจสอบโปรไฟล์ได้";
    const status = message === "FORBIDDEN" ? 403 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
