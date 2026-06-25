"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setPending(false);
    if (!result?.ok) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label htmlFor="login-email">อีเมล</label>
      <input id="login-email" name="email" type="email" required />

      <label htmlFor="login-password">รหัสผ่าน</label>
      <input id="login-password" name="password" type="password" required />

      <div className="form-row">
        <Link href="/forgot-password">ลืมรหัสผ่าน?</Link>
      </div>

      {error && <p className="form-message error">{error}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <p className="auth-switch">
        ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link>
      </p>
    </form>
  );
}
