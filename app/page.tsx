import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div>
          <p className="eyebrow">Travel community</p>
          <h1>พบผู้คน งาน และเพื่อนร่วมทางที่เหมาะกับคุณ</h1>
          <p>
            สำรวจโปรไฟล์สมาชิกที่ผ่านการตรวจสอบได้ฟรี
            หรือสมัครสมาชิกเพื่อสร้างโปรไฟล์ของคุณเอง
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/members">ดูโปรไฟล์สมาชิก</Link>
            <Link className="secondary-link" href="/register">สมัครสมาชิก</Link>
          </div>
        </div>
      </section>
      <section className="home-features">
        <article><h2>บุคคลทั่วไป</h2><p>ดูโปรไฟล์ที่ Admin ตรวจสอบแล้วได้โดยไม่ต้องเข้าสู่ระบบ</p></article>
        <article><h2>สมาชิก</h2><p>สร้างโปรไฟล์ เพิ่มรูป แก้ไขข้อมูล รายงาน และบล็อกผู้ใช้ได้</p></article>
        <article><h2>ผู้ดูแลระบบ</h2><p>ตรวจสอบโปรไฟล์ เนื้อหา และรายงานก่อนเผยแพร่</p></article>
      </section>
    </>
  );
}
