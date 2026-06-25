"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.message ?? "ไม่สามารถส่งลิงก์ได้");
      return;
    }
    setMessage(data.message);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="forgot-email">อีเมลที่ใช้สมัคร</label>
      <input id="forgot-email" name="email" type="email" required />

      {message && <p className="form-message success">{message}</p>}
      {error && <p className="form-message error">{error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
      </button>

      <p className="auth-switch">
        <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
      </p>
    </form>
  );
}
