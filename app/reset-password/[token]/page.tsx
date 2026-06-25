import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import { authOptions } from "@/lib/auth";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const { token } = await params;

  return (
    <div className="auth-page">
      <main className="auth-card">
        <p className="eyebrow">ความปลอดภัยของบัญชี</p>
        <h1>ตั้งรหัสผ่านใหม่</h1>
        <p className="auth-description">
          เลือกรหัสผ่านใหม่ที่คาดเดาได้ยากและไม่ซ้ำกับบริการอื่น
        </p>
        <ResetPasswordForm token={token} />
      </main>
    </div>
  );
}
