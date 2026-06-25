"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: form.get("password"),
        confirmPassword: form.get("confirmPassword"),
      }),
    });
    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.message ?? "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
      return;
    }
    router.push("/login?reset=1");
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="new-password">รหัสผ่านใหม่</label>
      <input
        id="new-password"
        name="password"
        type="password"
        required
        minLength={8}
      />

      <label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</label>
      <input
        id="confirm-password"
        name="confirmPassword"
        type="password"
        required
        minLength={8}
      />

      {error && <p className="form-message error">{error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
