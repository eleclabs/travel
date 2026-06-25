import Image from "next/image";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import MemberSafetyActions from "@/components/MemberSafetyActions";
import { authOptions } from "@/lib/auth";
import { PROFILE_TYPE_LABELS } from "@/lib/profile-labels";
import { getPublicProfile } from "@/services/user.service";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const profile = await getPublicProfile(id, session?.user?.id);
  if (!profile) notFound();

  return (
    <section className="content-page">
      <article className="public-profile">
        <div className="avatar avatar-xl">
          {profile.profileImage ? (
            <Image
              src={profile.profileImage}
              alt={profile.nickname}
              fill
              sizes="180px"
              unoptimized
            />
          ) : (
            <span>{profile.nickname.slice(0, 1)}</span>
          )}
        </div>
        <div className="public-profile-content">
          <div className="member-title">
            <h1>{profile.nickname}</h1>
            {profile.isOpenToWork && (
              <span className="work-badge">เปิดรับงาน</span>
            )}
          </div>
          <p className="profile-meta">
            {PROFILE_TYPE_LABELS[profile.profileType]} · อายุ {profile.age} ปี ·{" "}
            {profile.province}
          </p>
          <p className="profile-bio">{profile.bio}</p>
          <h2>ทักษะ</h2>
          <div className="skill-list">
            {profile.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          {session?.user && session.user.id !== profile.id && (
            <MemberSafetyActions userId={profile.id} />
          )}
        </div>
      </article>
    </section>
  );
}
