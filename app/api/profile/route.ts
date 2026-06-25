import { NextResponse } from "next/server";
import { requireMember } from "@/lib/access";
import { profileSchema } from "@/lib/validators";
import {
  clearOwnProfile,
  getOwnProfile,
  updateOwnProfile,
} from "@/services/user.service";

export async function GET() {
  try {
    const member = await requireMember();
    return NextResponse.json({ profile: await getOwnProfile(member.id) });
  } catch {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const member = await requireMember();
    const data = profileSchema.parse(await request.json());
    await updateOwnProfile(member.id, data);
    return NextResponse.json({
      success: true,
      message: "บันทึกแล้ว และส่งโปรไฟล์ให้ผู้ดูแลตรวจสอบ",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถบันทึกโปรไฟล์ได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    const member = await requireMember();
    await clearOwnProfile(member.id);
    return NextResponse.json({ success: true, message: "ลบข้อมูลโปรไฟล์แล้ว" });
  } catch {
    return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }
}
