import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { assertLegalProfileContent } from "@/lib/content-policy";
import ChatMessage from "@/models/ChatMessage";
import ContactRequest from "@/models/ContactRequest";
import User from "@/models/User";

type Participant = {
  id: string;
  name: string;
  email: string;
};

async function getParticipants(senderId: string, receiverId: string) {
  if (
    senderId === receiverId ||
    !mongoose.isValidObjectId(senderId) ||
    !mongoose.isValidObjectId(receiverId)
  ) {
    throw new Error("ข้อมูลผู้ส่งหรือผู้รับไม่ถูกต้อง");
  }

  await connectDB();
  const [sender, receiver, blocked] = await Promise.all([
    User.findOne({ _id: senderId, isActive: true })
      .select("name nickname email isEmailVerified")
      .lean(),
    User.findOne({
      _id: receiverId,
      isActive: true,
      moderationStatus: "approved",
    })
      .select("name nickname email")
      .lean(),
    User.exists({
      $or: [
        { _id: senderId, blockedUsers: receiverId },
        { _id: receiverId, blockedUsers: senderId },
      ],
    }),
  ]);

  if (!sender || !receiver) throw new Error("ไม่พบผู้ใช้");
  if (sender.isEmailVerified === false) {
    throw new Error("กรุณายืนยันอีเมลก่อนติดต่อสมาชิก");
  }
  if (blocked) throw new Error("ไม่สามารถติดต่อผู้ใช้นี้ได้");

  return {
    sender: {
      id: sender._id.toString(),
      name: sender.nickname || sender.name,
      email: sender.email,
    } satisfies Participant,
    receiver: {
      id: receiver._id.toString(),
      name: receiver.nickname || receiver.name,
      email: receiver.email,
    } satisfies Participant,
  };
}

export async function createContactRequest(
  senderId: string,
  input: { receiverId: string; message: string }
) {
  assertLegalProfileContent([input.message]);
  const participants = await getParticipants(senderId, input.receiverId);

  const recent = await ContactRequest.exists({
    sender: senderId,
    receiver: input.receiverId,
    createdAt: { $gt: new Date(Date.now() - 60_000) },
  });
  if (recent) throw new Error("กรุณารอ 1 นาทีก่อนส่งคำขอติดต่ออีกครั้ง");

  const request = await ContactRequest.create({
    sender: senderId,
    receiver: input.receiverId,
    message: input.message,
  });
  return { id: request._id.toString(), ...participants };
}

export async function createChatMessage(
  senderId: string,
  input: { receiverId: string; message: string }
) {
  assertLegalProfileContent([input.message]);
  const participants = await getParticipants(senderId, input.receiverId);

  const recent = await ChatMessage.exists({
    sender: senderId,
    receiver: input.receiverId,
    createdAt: { $gt: new Date(Date.now() - 5_000) },
  });
  if (recent) throw new Error("กรุณารอสักครู่ก่อนส่งข้อความถัดไป");

  const chat = await ChatMessage.create({
    sender: senderId,
    receiver: input.receiverId,
    message: input.message,
  });
  return { id: chat._id.toString(), ...participants };
}
