import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Travel Community",
  description: "ชุมชนสำหรับหางาน นายจ้าง เพื่อนเที่ยว และเพื่อนคุย",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="th">
      <body className="layout">
        <Navbar user={session?.user ?? null} />
        <main className="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
