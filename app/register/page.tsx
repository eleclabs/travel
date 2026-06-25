import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/forms/RegisterForm";
import { authOptions } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="auth-page">
      <main className="auth-card">
        <p className="eyebrow">เริ่มต้นการเดินทาง</p>
        <h1>สมัครสมาชิก</h1>
        <p className="auth-description">สร้างบัญชีใหม่ได้ภายในไม่กี่ขั้นตอน</p>
        <RegisterForm />
      </main>
    </div>
  );
}
