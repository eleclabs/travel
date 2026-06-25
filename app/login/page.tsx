import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/forms/LoginForm";
import { authOptions } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    registered?: string;
    reset?: string;
    notice?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const query = await searchParams;
  const successMessage = query.notice
    ? query.notice
    : query.registered
      ? "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี"
    : query.reset
      ? "ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบ"
      : "";

  return (
    <div className="auth-page">
      <main className="auth-card">
        <p className="eyebrow">ยินดีต้อนรับกลับ</p>
        <h1>เข้าสู่ระบบ</h1>
        <p className="auth-description">เข้าสู่ระบบเพื่อจัดการทริปของคุณ</p>
        {successMessage && (
          <p className="form-message success">{successMessage}</p>
        )}
        <LoginForm />
      </main>
    </div>
  );
}
