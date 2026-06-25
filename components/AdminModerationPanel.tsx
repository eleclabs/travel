"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PROFILE_TYPE_LABELS } from "@/lib/profile-labels";

type ReviewUser = {
  id: string;
  email: string;
  profileImage: string;
  nickname: string;
  age: number;
  province: string;
  profileType: string;
  skills: string[];
  bio: string;
  isOpenToWork: boolean;
  isEmailVerified: boolean;
  moderationStatus: string;
  moderationNote: string;
};

export default function AdminModerationPanel({
  users,
  reports,
}: {
  users: ReviewUser[];
  reports: Array<{
    id: string;
    reporter: string;
    reportedUser: string;
    reason: string;
    details: string;
    status: string;
    createdAt: Date;
  }>;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState("");

  async function moderate(
    userId: string,
    status: "approved" | "rejected",
    note: string
  ) {
    setPendingId(userId);
    await fetch(`/api/admin/users/${userId}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    });
    setPendingId("");
    router.refresh();
  }

  async function updateReport(
    reportId: string,
    status: "resolved" | "dismissed"
  ) {
    setPendingId(reportId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    setPendingId("");
    router.refresh();
  }

  return (
    <div className="admin-sections">
      <section>
        <h2>โปรไฟล์รอตรวจสอบ ({users.length})</h2>
        <div className="review-list">
          {users.length === 0 && <p>ไม่มีโปรไฟล์รอตรวจสอบ</p>}
          {users.map((user) => (
            <article className="review-card" key={user.id}>
              <div className="avatar">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.nickname}
                    fill
                    sizes="96px"
                    unoptimized
                  />
                ) : (
                  <span>?</span>
                )}
              </div>
              <div className="review-content">
                <h3>{user.nickname || "ยังไม่มีชื่อเล่น"}</h3>
                <p>
                  {user.email} · {PROFILE_TYPE_LABELS[user.profileType]} ·{" "}
                  {user.province}
                </p>
                <p>{user.bio}</p>
                <div className="skill-list">
                  {user.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <label>
                  หมายเหตุถึงสมาชิก
                  <textarea id={`note-${user.id}`} defaultValue={user.moderationNote} />
                </label>
                <div className="form-actions">
                  <button
                    type="button"
                    disabled={pendingId === user.id}
                    onClick={() =>
                      moderate(
                        user.id,
                        "approved",
                        (
                          document.getElementById(
                            `note-${user.id}`
                          ) as HTMLTextAreaElement
                        ).value
                      )
                    }
                  >
                    อนุมัติ
                  </button>
                  <button
                    className="danger-button"
                    type="button"
                    disabled={pendingId === user.id}
                    onClick={() =>
                      moderate(
                        user.id,
                        "rejected",
                        (
                          document.getElementById(
                            `note-${user.id}`
                          ) as HTMLTextAreaElement
                        ).value
                      )
                    }
                  >
                    ให้แก้ไข
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>รายงานผู้ใช้ ({reports.length})</h2>
        <div className="report-list">
          {reports.length === 0 && <p>ไม่มีรายงานที่เปิดอยู่</p>}
          {reports.map((report) => (
            <article className="report-card" key={report.id}>
              <strong>{report.reason}</strong>
              <p>
                ผู้รายงาน: {report.reporter} · ผู้ถูกรายงาน: {report.reportedUser}
              </p>
              <p>{report.details || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
              <small>{new Date(report.createdAt).toLocaleString("th-TH")}</small>
              <div className="form-actions">
                <button
                  type="button"
                  disabled={pendingId === report.id}
                  onClick={() => updateReport(report.id, "resolved")}
                >
                  ดำเนินการแล้ว
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={pendingId === report.id}
                  onClick={() => updateReport(report.id, "dismissed")}
                >
                  ยกเลิกรายงาน
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
