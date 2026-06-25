import Link from "next/link";
import { verifyEmail } from "@/services/auth.service";
import { notifyEmailVerified } from "@/services/mail.service";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let success = true;
  let message = "ยืนยันอีเมลสำเร็จ คุณสามารถเข้าสู่ระบบและสร้างโปรไฟล์ได้แล้ว";

  try {
    const user = await verifyEmail(token);
    await notifyEmailVerified(user);
  } catch (error) {
    success = false;
    message =
      error instanceof Error ? error.message : "ไม่สามารถยืนยันอีเมลได้";
  }

  return (
    <div className="auth-page">
      <main className="auth-card">
        <h1>{success ? "ยืนยันอีเมลสำเร็จ" : "ยืนยันอีเมลไม่สำเร็จ"}</h1>
        <p className={`form-message ${success ? "success" : "error"}`}>
          {message}
        </p>
        <p className="auth-switch">
          <Link href={success ? "/login" : "/profile"}>
            {success ? "ไปหน้าเข้าสู่ระบบ" : "กลับไปหน้าโปรไฟล์"}
          </Link>
        </p>
      </main>
    </div>
  );
}
