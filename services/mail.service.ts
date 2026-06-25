import "server-only";
import { Resend } from "resend";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

type MailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function layout(title: string, content: string) {
  return `
    <div style="max-width:640px;margin:auto;padding:28px;font-family:Arial,sans-serif;color:#16302b">
      <div style="padding:18px 22px;background:#0f5c4d;color:#fff;border-radius:14px 14px 0 0">
        <strong style="font-size:20px">Travel Community</strong>
      </div>
      <div style="padding:26px;border:1px solid #dbe7e3;border-top:0;border-radius:0 0 14px 14px">
        <h2 style="margin-top:0">${escapeHtml(title)}</h2>
        ${content}
        <p style="margin-top:28px;color:#64748b;font-size:13px">อีเมลนี้ส่งโดยระบบอัตโนมัติ กรุณาอย่าส่งรหัสผ่านหรือข้อมูลสำคัญผ่านอีเมล</p>
      </div>
    </div>
  `;
}

async function sendMail(input: MailInput) {
  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  const uniqueRecipients = [...new Set(recipients.filter(Boolean))];
  if (uniqueRecipients.length === 0) return;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.info(`${input.subject} -> ${uniqueRecipients.join(", ")}`);
    return;
  }

  const { error } = await new Resend(apiKey).emails.send({
    from,
    ...input,
    to: uniqueRecipients,
  });
  if (error) throw new Error("ไม่สามารถส่งอีเมลได้ในขณะนี้");
}

async function getAdminEmails() {
  await connectDB();
  const admins = await User.find({ role: "admin", isActive: true })
    .select("email")
    .lean();
  const fallback = (process.env.ADMIN_NOTIFICATION_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...admins.map((admin) => admin.email), ...fallback])];
}

async function notifyAdmins(subject: string, text: string, html: string) {
  const emails = await getAdminEmails();
  await sendMail({ to: emails, subject: `[Admin] ${subject}`, text, html });
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  await sendMail({
    to: email,
    subject: "ยืนยันอีเมลสมาชิก Travel",
    text: `เปิดลิงก์นี้ภายใน 24 ชั่วโมงเพื่อยืนยันอีเมล: ${verifyUrl}`,
    html: layout(
      "ยืนยันอีเมล",
      `<p>กรุณายืนยันอีเมลภายใน 24 ชั่วโมง</p>
       <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:white;text-decoration:none;border-radius:8px">ยืนยันอีเมล</a></p>`
    ),
  });
}

export async function notifyAdminNewRegistration(input: {
  name: string;
  email: string;
}) {
  await notifyAdmins(
    "มีสมาชิกสมัครใหม่",
    `${input.name} (${input.email}) สมัครสมาชิกใหม่`,
    layout(
      "สมาชิกสมัครใหม่",
      `<p><strong>${escapeHtml(input.name)}</strong> สมัครสมาชิกด้วยอีเมล ${escapeHtml(input.email)}</p>`
    )
  );
}

export async function notifyEmailVerified(input: {
  name: string;
  email: string;
}) {
  await Promise.allSettled([
    sendMail({
      to: input.email,
      subject: "ยืนยันอีเมลสำเร็จ",
      text: "อีเมลของคุณได้รับการยืนยันแล้ว",
      html: layout(
        "ยืนยันอีเมลสำเร็จ",
        "<p>บัญชีของคุณพร้อมใช้งาน สามารถเข้าสู่ระบบและสร้างโปรไฟล์ได้แล้ว</p>"
      ),
    }),
    notifyAdmins(
      "สมาชิกยืนยันอีเมลแล้ว",
      `${input.name} (${input.email}) ยืนยันอีเมลแล้ว`,
      layout(
        "สมาชิกยืนยันอีเมลแล้ว",
        `<p>${escapeHtml(input.name)} (${escapeHtml(input.email)}) ยืนยันอีเมลเรียบร้อย</p>`
      )
    ),
  ]);
}

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  await sendMail({
    to: email,
    subject: "คำขอตั้งรหัสผ่านใหม่",
    text: `เปิดลิงก์นี้ภายใน 15 นาที: ${resetUrl}`,
    html: layout(
      "ตั้งรหัสผ่านใหม่",
      `<p>เราได้รับคำขอตั้งรหัสผ่านใหม่ ลิงก์นี้มีอายุ 15 นาที</p>
       <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:white;text-decoration:none;border-radius:8px">ตั้งรหัสผ่านใหม่</a></p>
       <p>หากคุณไม่ได้เป็นผู้ส่งคำขอ ให้ละเว้นอีเมลนี้และตรวจสอบความปลอดภัยของบัญชี</p>`
    ),
  });
}

export async function notifyAdminForgotPassword(email: string) {
  await notifyAdmins(
    "มีคำขอลืมรหัสผ่าน",
    `มีคำขอตั้งรหัสผ่านใหม่สำหรับ ${email}`,
    layout(
      "คำขอลืมรหัสผ่าน",
      `<p>มีคำขอตั้งรหัสผ่านใหม่สำหรับบัญชี ${escapeHtml(email)}</p>`
    )
  );
}

export async function notifyPasswordReset(input: {
  name: string;
  email: string;
}) {
  await Promise.allSettled([
    sendMail({
      to: input.email,
      subject: "รหัสผ่านถูกเปลี่ยนแล้ว",
      text: "รหัสผ่านบัญชี Travel ของคุณถูกเปลี่ยนเรียบร้อย",
      html: layout(
        "เปลี่ยนรหัสผ่านสำเร็จ",
        "<p>รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อย หากไม่ใช่คุณ กรุณาติดต่อผู้ดูแลระบบทันที</p>"
      ),
    }),
    notifyAdmins(
      "สมาชิกรหัสผ่านถูกเปลี่ยน",
      `${input.name} (${input.email}) เปลี่ยนรหัสผ่านสำเร็จ`,
      layout(
        "เปลี่ยนรหัสผ่านสำเร็จ",
        `<p>${escapeHtml(input.name)} (${escapeHtml(input.email)}) เปลี่ยนรหัสผ่านแล้ว</p>`
      )
    ),
  ]);
}

export async function notifyContactRequest(input: {
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message: string;
  profileUrl: string;
}) {
  const preview = escapeHtml(input.message);
  await Promise.allSettled([
    sendMail({
      to: input.receiverEmail,
      subject: `${input.senderName} ส่งคำขอติดต่อถึงคุณ`,
      text: `${input.senderName}: ${input.message}`,
      html: layout(
        "คำขอติดต่อใหม่",
        `<p><strong>${escapeHtml(input.senderName)}</strong> ต้องการติดต่อคุณ</p>
         <blockquote style="padding:12px;background:#f1f5f9">${preview}</blockquote>
         <p><a href="${input.profileUrl}">ดูโปรไฟล์ผู้ส่ง</a></p>`
      ),
    }),
    sendMail({
      to: input.senderEmail,
      subject: "ส่งคำขอติดต่อแล้ว",
      text: `ส่งคำขอติดต่อถึง ${input.receiverName} แล้ว`,
      html: layout(
        "ส่งคำขอติดต่อแล้ว",
        `<p>ระบบส่งคำขอติดต่อของคุณถึง ${escapeHtml(input.receiverName)} แล้ว</p>`
      ),
    }),
    notifyAdmins(
      "มี Contact Request ใหม่",
      `${input.senderName} ส่งคำขอติดต่อถึง ${input.receiverName}`,
      layout(
        "Contact Request ใหม่",
        `<p>${escapeHtml(input.senderName)} (${escapeHtml(input.senderEmail)}) ส่งคำขอติดต่อถึง ${escapeHtml(input.receiverName)} (${escapeHtml(input.receiverEmail)})</p>
         <blockquote style="padding:12px;background:#f1f5f9">${preview}</blockquote>`
      )
    ),
  ]);
}

export async function notifyChatMessage(input: {
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message: string;
  chatUrl: string;
}) {
  const preview =
    input.message.length > 180
      ? `${input.message.slice(0, 180)}…`
      : input.message;
  await Promise.allSettled([
    sendMail({
      to: input.receiverEmail,
      subject: `ข้อความใหม่จาก ${input.senderName}`,
      text: preview,
      html: layout(
        "คุณมีข้อความใหม่",
        `<p><strong>${escapeHtml(input.senderName)}</strong> ส่งข้อความถึงคุณ</p>
         <blockquote style="padding:12px;background:#f1f5f9">${escapeHtml(preview)}</blockquote>
         <p><a href="${input.chatUrl}">เปิดการสนทนา</a></p>`
      ),
    }),
    notifyAdmins(
      "มี Chat Message ใหม่",
      `${input.senderName} ส่งข้อความถึง ${input.receiverName}`,
      layout(
        "Chat Message ใหม่",
        `<p>${escapeHtml(input.senderName)} (${escapeHtml(input.senderEmail)}) ส่งข้อความถึง ${escapeHtml(input.receiverName)} (${escapeHtml(input.receiverEmail)})</p>
         <p>ตัวอย่างข้อความ: ${escapeHtml(preview)}</p>`
      )
    ),
  ]);
}
