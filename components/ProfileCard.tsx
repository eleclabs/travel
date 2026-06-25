import Image from "next/image";
import Link from "next/link";
import { PROFILE_TYPE_LABELS } from "@/lib/profile-labels";
import type { PublicProfile } from "@/services/user.service";

export default function ProfileCard({ profile }: { profile: PublicProfile }) {
  return (
    <article className="member-card">
      <div className="avatar">
        {profile.profileImage ? (
          <Image
            src={profile.profileImage}
            alt={profile.nickname}
            fill
            sizes="96px"
            unoptimized
          />
        ) : (
          <span>{profile.nickname.slice(0, 1)}</span>
        )}
      </div>
      <div>
        <div className="member-title">
          <h2>{profile.nickname}</h2>
          {profile.isOpenToWork && <span className="work-badge">เปิดรับงาน</span>}
        </div>
        <p>
          {PROFILE_TYPE_LABELS[profile.profileType]} · อายุ {profile.age} ปี ·{" "}
          {profile.province}
        </p>
        <div className="skill-list">
          {profile.skills.slice(0, 4).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <Link className="card-link" href={`/members/${profile.id}`}>
          ดูโปรไฟล์
        </Link>
      </div>
    </article>
  );
}
