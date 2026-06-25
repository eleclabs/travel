import { NextResponse } from "next/server";
import { requireMember } from "@/lib/access";
import { blockUser, unblockUser } from "@/services/user.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const member = await requireMember();
    const { userId } = await params;
    await blockUser(member.id, userId);
    return NextResponse.json({ success: true, message: "บล็อกผู้ใช้แล้ว" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถบล็อกผู้ใช้ได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const member = await requireMember();
    const { userId } = await params;
    await unblockUser(member.id, userId);
    return NextResponse.json({ success: true, message: "ยกเลิกการบล็อกแล้ว" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถยกเลิกการบล็อกได้";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
