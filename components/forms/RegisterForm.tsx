"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.message ?? "ไม่สามารถสมัครสมาชิกได้");
      return;
    }

    router.push(`/login?registered=1&notice=${encodeURIComponent(data.message)}`);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="register-name">ชื่อ</label>
      <input id="register-name" name="name" required minLength={2} />

      <label htmlFor="register-email">อีเมล</label>
      <input id="register-email" name="email" type="email" required />

      <label htmlFor="register-password">รหัสผ่าน</label>
      <input
        id="register-password"
        name="password"
        type="password"
        required
        minLength={8}
      />
      <p className="field-hint">อย่างน้อย 8 ตัวอักษร และมีทั้งตัวอักษรกับตัวเลข</p>

      {error && <p className="form-message error">{error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>

      <p className="auth-switch">
        มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
      </p>
    </form>
  );
}
