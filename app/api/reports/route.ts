import { NextResponse } from "next/server";
import { requireMember } from "@/lib/access";
import { reportSchema } from "@/lib/validators";
import { reportUser } from "@/services/user.service";

export async function POST(request: Request) {
  try {
    const member = await requireMember();
    const data = reportSchema.parse(await request.json());
    await reportUser(member.id, data);
    return NextResponse.json({
      success: true,
      message: "ส่งรายงานให้ผู้ดูแลระบบแล้ว",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถส่งรายงานได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
