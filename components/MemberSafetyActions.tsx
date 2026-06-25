"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MemberSafetyActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [pending, setPending] = useState(false);

  async function block() {
    if (!confirm("ยืนยันการบล็อกผู้ใช้นี้?")) return;
    const response = await fetch(`/api/blocks/${userId}`, { method: "POST" });
    const data = await response.json();
    if (response.ok) router.push("/members");
    else setMessage(data.message);
  }

  async function report(formData: FormData) {
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportedUserId: userId,
        reason: formData.get("reason"),
        details: formData.get("details"),
      }),
    });
    const data = await response.json();
    setMessage(data.message);
    if (response.ok) setShowReport(false);
  }

  async function sendCommunication(
    endpoint: string,
    formData: FormData,
    close: () => void
  ) {
    setPending(true);
    setMessage("");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: userId,
        message: formData.get("message"),
      }),
    });
    const data = await response.json();
    setPending(false);
    setMessage(data.message);
    if (response.ok) close();
  }

  return (
    <div className="safety-actions">
      <button
        type="button"
        onClick={() => {
          setShowContact((value) => !value);
          setShowChat(false);
        }}
      >
        ส่งคำขอติดต่อ
      </button>
      <button
        type="button"
        onClick={() => {
          setShowChat((value) => !value);
          setShowContact(false);
        }}
      >
        ส่งข้อความ
      </button>
      <button type="button" onClick={() => setShowReport((value) => !value)}>
        รายงานผู้ใช้
      </button>
      <button className="danger-button" type="button" onClick={block}>
        บล็อกผู้ใช้
      </button>
      {showReport && (
        <form action={report} className="report-form">
          <select name="reason" required>
            <option value="illegal_service">บริการผิดกฎหมาย</option>
            <option value="harassment">คุกคาม</option>
            <option value="fraud">หลอกลวง</option>
            <option value="fake_profile">โปรไฟล์ปลอม</option>
            <option value="other">อื่น ๆ</option>
          </select>
          <textarea
            name="details"
            maxLength={500}
            placeholder="รายละเอียดเพิ่มเติม"
          />
          <button type="submit">ส่งรายงาน</button>
        </form>
      )}
      {showContact && (
        <form
          action={(formData) =>
            sendCommunication("/api/contact-requests", formData, () =>
              setShowContact(false)
            )
          }
          className="report-form"
        >
          <textarea
            name="message"
            minLength={5}
            maxLength={500}
            required
            placeholder="แนะนำตัวและบอกเหตุผลที่ต้องการติดต่อ"
          />
          <button type="submit" disabled={pending}>
            {pending ? "กำลังส่ง..." : "ส่ง Contact Request"}
          </button>
        </form>
      )}
      {showChat && (
        <form
          action={(formData) =>
            sendCommunication("/api/chat/messages", formData, () =>
              setShowChat(false)
            )
          }
          className="report-form"
        >
          <textarea
            name="message"
            maxLength={2000}
            required
            placeholder="พิมพ์ข้อความ"
          />
          <button type="submit" disabled={pending}>
            {pending ? "กำลังส่ง..." : "ส่งข้อความ"}
          </button>
        </form>
      )}
      {message && <p className="form-message">{message}</p>}
    </div>
  );
}
