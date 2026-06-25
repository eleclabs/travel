import { getServerSession } from "next-auth";
import ProfileCard from "@/components/ProfileCard";
import { authOptions } from "@/lib/auth";
import { getPublicProfiles } from "@/services/user.service";

export default async function MembersPage() {
  const session = await getServerSession(authOptions);
  const profiles = await getPublicProfiles(session?.user?.id);

  return (
    <section className="content-page">
      <div className="page-heading">
        <p className="eyebrow">Community</p>
        <h1>ค้นหาสมาชิก</h1>
        <p>
          บุคคลทั่วไปสามารถดูโปรไฟล์ที่ผ่านการตรวจสอบแล้วได้
          ส่วนการรายงานและบล็อกต้องเข้าสู่ระบบ
        </p>
      </div>
      <div className="member-grid">
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
      {profiles.length === 0 && (
        <div className="empty-state">ยังไม่มีโปรไฟล์ที่ผ่านการอนุมัติ</div>
      )}
    </section>
  );
}
