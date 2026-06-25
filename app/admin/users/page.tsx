import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminModerationPanel from "@/components/AdminModerationPanel";
import { authOptions } from "@/lib/auth";
import { getAdminReviewData } from "@/services/user.service";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const data = await getAdminReviewData();
  return (
    <section className="content-page">
      <div className="page-heading">
        <p className="eyebrow">Admin</p>
        <h1>ตรวจสอบโปรไฟล์และรายงาน</h1>
        <p>อนุมัติโปรไฟล์ก่อนเผยแพร่ และตรวจสอบรายงานด้านความปลอดภัย</p>
      </div>
      <AdminModerationPanel users={data.users} reports={data.reports} />
    </section>
  );
}
