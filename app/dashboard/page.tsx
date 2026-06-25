import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { MODERATION_LABELS } from "@/lib/profile-labels";
import { getOwnProfile } from "@/services/user.service";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const profile = await getOwnProfile(session.user.id);

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <p className="eyebrow">Dashboard</p>
        <h1>สวัสดี {profile?.nickname || session.user.name || "สมาชิก"}</h1>
        <p>จัดการโปรไฟล์และสถานะความปลอดภัยของบัญชีได้จากหน้านี้</p>
      </div>
      <div className="dashboard-grid">
        <article className="dashboard-card">
          <span>สถานะอีเมล</span>
          <strong className={profile?.isEmailVerified ? "status-active" : ""}>
            {profile?.isEmailVerified ? "ยืนยันแล้ว" : "รอยืนยัน"}
          </strong>
          <Link href="/profile">จัดการความปลอดภัย</Link>
        </article>
        <article className="dashboard-card">
          <span>สถานะโปรไฟล์</span>
          <strong>{MODERATION_LABELS[profile?.moderationStatus ?? "draft"]}</strong>
          <Link href="/profile">แก้ไขโปรไฟล์</Link>
        </article>
        <article className="dashboard-card">
          <span>ระดับผู้ใช้งาน</span>
          <strong>{session.user.role === "admin" ? "Admin" : "Member"}</strong>
          <Link href="/members">ดูสมาชิกทั้งหมด</Link>
        </article>
      </div>
    </section>
  );
}
