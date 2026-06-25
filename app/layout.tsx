import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "GoMate — หาเพื่อนที่ใช่สำหรับทุกกิจกรรม",
  description:
    "ชุมชนหาเพื่อนเที่ยว เพื่อนกิน เพื่อนออกกำลังกาย เพื่อนร่วมงาน เพื่อนคุย และเพื่อนร่วมกิจกรรม",
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
