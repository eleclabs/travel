"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";

type ProfileData = {
  profileImage: string;
  nickname: string;
  age: number | string;
  province: string;
  profileType: string;
  skills: string[];
  bio: string;
  isOpenToWork: boolean;
  isEmailVerified: boolean;
  moderationStatus: string;
  moderationNote: string;
};

async function resizeImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("ไฟล์ต้นฉบับต้องมีขนาดไม่เกิน 5 MB");
  }

  const bitmap = await createImageBitmap(file);
  const maxSize = 640;
  const ratio = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.82);
}

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [image, setImage] = useState(initial.profileImage);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onImageChange(file?: File) {
    if (!file) return;
    setError("");
    try {
      setImage(await resizeImage(file));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "อ่านรูปภาพไม่สำเร็จ");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileImage: image,
        nickname: form.get("nickname"),
        age: form.get("age"),
        province: form.get("province"),
        profileType: form.get("profileType"),
        skills: String(form.get("skills") ?? "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        bio: form.get("bio"),
        isOpenToWork: form.get("isOpenToWork") === "on",
      }),
    });
    const data = await response.json();
    setPending(false);
    if (response.ok) setMessage(data.message);
    else setError(data.message);
  }

  async function clearProfile() {
    if (!confirm("ยืนยันการลบข้อมูลโปรไฟล์ทั้งหมด?")) return;
    setPending(true);
    const response = await fetch("/api/profile", { method: "DELETE" });
    setPending(false);
    if (!response.ok) {
      setError("ไม่สามารถลบข้อมูลได้");
      return;
    }
    setImage("");
    formRef.current?.reset();
    setMessage("ลบข้อมูลโปรไฟล์แล้ว");
  }

  async function resendVerification() {
    setPending(true);
    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
    });
    const data = await response.json();
    setPending(false);
    if (response.ok) setMessage(data.message);
    else setError(data.message);
  }

  return (
    <form ref={formRef} className="profile-form" onSubmit={submit}>
      <div className="profile-status-row">
        <span className={`status-pill ${initial.moderationStatus}`}>
          สถานะ: {initial.moderationStatus}
        </span>
        <span className={initial.isEmailVerified ? "verified" : "unverified"}>
          {initial.isEmailVerified ? "✓ ยืนยันอีเมลแล้ว" : "ยังไม่ยืนยันอีเมล"}
        </span>
      </div>

      {!initial.isEmailVerified && (
        <button
          className="secondary-button"
          type="button"
          onClick={resendVerification}
          disabled={pending}
        >
          ส่งอีเมลยืนยันอีกครั้ง
        </button>
      )}

      {initial.moderationNote && (
        <p className="form-message error">
          หมายเหตุจากผู้ดูแล: {initial.moderationNote}
        </p>
      )}

      <div className="image-editor">
        <div className="avatar avatar-large">
          {image ? (
            <Image src={image} alt="รูปโปรไฟล์" fill sizes="160px" unoptimized />
          ) : (
            <span>เพิ่มรูป</span>
          )}
        </div>
        <div>
          <label className="file-button">
            เลือกรูปโปรไฟล์
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => onImageChange(event.target.files?.[0])}
            />
          </label>
          {image && (
            <button
              className="text-button danger-text"
              type="button"
              onClick={() => setImage("")}
            >
              ลบรูป
            </button>
          )}
        </div>
      </div>

      <div className="form-grid">
        <label>
          ชื่อเล่น
          <input name="nickname" defaultValue={initial.nickname} required />
        </label>
        <label>
          อายุ
          <input
            name="age"
            type="number"
            min="18"
            max="100"
            defaultValue={initial.age}
            required
          />
        </label>
        <label>
          จังหวัด
          <input name="province" defaultValue={initial.province} required />
        </label>
        <label>
          ประเภทโปรไฟล์
          <select name="profileType" defaultValue={initial.profileType}>
            <option value="job_seeker">หางาน</option>
            <option value="employer">นายจ้าง</option>
            <option value="travel_friend">เพื่อนเที่ยว</option>
            <option value="chat_friend">เพื่อนคุย</option>
          </select>
        </label>
      </div>

      <label>
        ทักษะ
        <input
          name="skills"
          defaultValue={initial.skills.join(", ")}
          placeholder="เช่น ถ่ายภาพ, ภาษาอังกฤษ, ทำอาหาร"
        />
        <small>คั่นแต่ละทักษะด้วยเครื่องหมายจุลภาค</small>
      </label>

      <label>
        รายละเอียดแนะนำตัว
        <textarea name="bio" rows={6} defaultValue={initial.bio} required />
      </label>

      <label className="checkbox-label">
        <input
          name="isOpenToWork"
          type="checkbox"
          defaultChecked={initial.isOpenToWork}
        />
        เปิดรับงาน
      </label>

      <p className="policy-note">
        ห้ามเผยแพร่บริการหรือกิจกรรมที่ผิดกฎหมาย ระบบจะระงับการส่งโปรไฟล์ที่มีเนื้อหาต้องห้าม
      </p>

      {message && <p className="form-message success">{message}</p>}
      {error && <p className="form-message error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={pending}>
          {pending ? "กำลังบันทึก..." : "บันทึกและส่งตรวจ"}
        </button>
        <button
          className="danger-button"
          type="button"
          onClick={clearProfile}
          disabled={pending}
        >
          ลบข้อมูลส่วนตัว
        </button>
      </div>
    </form>
  );
}
