import { NextResponse } from "next/server";
import { requireMember } from "@/lib/access";
import { contactRequestSchema } from "@/lib/validators";
import { createContactRequest } from "@/services/communication.service";
import { notifyContactRequest } from "@/services/mail.service";

export async function POST(request: Request) {
  try {
    const member = await requireMember();
    const input = contactRequestSchema.parse(await request.json());
    const result = await createContactRequest(member.id, input);
    const origin = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;

    await notifyContactRequest({
      senderName: result.sender.name,
      senderEmail: result.sender.email,
      receiverName: result.receiver.name,
      receiverEmail: result.receiver.email,
      message: input.message,
      profileUrl: `${origin}/members/${result.sender.id}`,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "ส่งคำขอติดต่อและอีเมลแจ้งเตือนแล้ว",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถส่งคำขอติดต่อได้";
    const status = message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
