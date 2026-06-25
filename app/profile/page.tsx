import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { authOptions } from "@/lib/auth";
import { getOwnProfile } from "@/services/user.service";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const profile = await getOwnProfile(session.user.id);
  if (!profile) redirect("/login");

  return (
    <section className="content-page profile-page">
      <div className="page-heading">
        <p className="eyebrow">Member profile</p>
        <h1>จัดการโปรไฟล์ของฉัน</h1>
        <p>
          เมื่อแก้ไขข้อมูล โปรไฟล์จะถูกส่งให้ผู้ดูแลระบบตรวจสอบก่อนแสดงต่อสาธารณะ
        </p>
      </div>
      <ProfileForm initial={profile} />
    </section>
  );
}
