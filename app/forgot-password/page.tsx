import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import { authOptions } from "@/lib/auth";

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="auth-page">
      <main className="auth-card">
        <p className="eyebrow">กู้คืนบัญชี</p>
        <h1>ลืมรหัสผ่าน</h1>
        <p className="auth-description">
          กรอกอีเมลของคุณ แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่
        </p>
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
