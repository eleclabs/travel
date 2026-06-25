import Link from "next/link";

const mateTypes = [
  ["✈️", "หาเพื่อนเที่ยว", "วางแผนทริป แชร์ค่าใช้จ่าย และออกเดินทางไปด้วยกัน"],
  ["🍜", "หาเพื่อนกิน", "ค้นหาร้านใหม่ คาเฟ่น่านั่ง และมื้ออร่อยกับเพื่อนใหม่"],
  ["🏃", "หาเพื่อนออกกำลังกาย", "วิ่ง ฟิตเนส ปั่นจักรยาน หรือเล่นกีฬาไปด้วยกัน"],
  ["💻", "หาเพื่อนร่วมงาน", "หาเพื่อนทำงาน อ่านหนังสือ และแลกเปลี่ยนไอเดีย"],
  ["💬", "หาเพื่อนคุย", "พูดคุย แบ่งปันเรื่องราว และสร้างมิตรภาพดี ๆ"],
  ["🎨", "หาเพื่อนร่วมกิจกรรม", "ไปคอนเสิร์ต เวิร์กช็อป อีเวนต์ และกิจกรรมที่ชอบ"],
];

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div>
          <p className="eyebrow">GoMate community</p>
          <h1>ทุกกิจกรรมสนุกขึ้น เมื่อมีเพื่อนที่ใช่ไปด้วยกัน</h1>
          <p>
            GoMate ช่วยให้คุณพบเพื่อนใหม่ที่มีความสนใจตรงกัน
            ไม่ว่าจะเที่ยว กิน ออกกำลังกาย ทำงาน พูดคุย หรือร่วมกิจกรรม
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/members">
              ค้นหาเพื่อน
            </Link>
            <Link className="secondary-link" href="/register">
              สร้างโปรไฟล์ฟรี
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        {mateTypes.map(([icon, title, description]) => (
          <article key={title}>
            <span className="feature-icon" aria-hidden="true">
              {icon}
            </span>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </>
  );
}
