import { NextResponse } from "next/server";
import { requireMember } from "@/lib/access";
import { chatMessageSchema } from "@/lib/validators";
import { createChatMessage } from "@/services/communication.service";
import { notifyChatMessage } from "@/services/mail.service";

export async function POST(request: Request) {
  try {
    const member = await requireMember();
    const input = chatMessageSchema.parse(await request.json());
    const result = await createChatMessage(member.id, input);
    const origin = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;

    await notifyChatMessage({
      senderName: result.sender.name,
      senderEmail: result.sender.email,
      receiverName: result.receiver.name,
      receiverEmail: result.receiver.email,
      message: input.message,
      chatUrl: `${origin}/members/${result.sender.id}`,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "ส่งข้อความและอีเมลแจ้งเตือนแล้ว",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ไม่สามารถส่งข้อความได้";
    const status = message === "UNAUTHORIZED" ? 401 : 400;
    return NextResponse.json({ success: false, message }, { status });
  }
}
