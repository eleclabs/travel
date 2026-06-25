"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavbarUser = {
  name?: string | null;
  role: "member" | "admin";
} | null;

export default function Navbar({ user }: { user: NavbarUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href))
      ? "active"
      : undefined;

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="logo" onClick={() => setOpen(false)}>
          GoMate
        </Link>
        <button
          className="menu-btn"
          type="button"
          aria-label="เปิดเมนู"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          ☰
        </button>
        <ul className={open ? "nav-links active-menu" : "nav-links"}>
          <li>
            <Link className={active("/")} href="/" onClick={() => setOpen(false)}>
              หน้าหลัก
            </Link>
          </li>
          <li>
            <Link className={active("/members")} href="/members" onClick={() => setOpen(false)}>
              ค้นหาสมาชิก
            </Link>
          </li>
          {user && (
            <>
              <li><Link className={active("/dashboard")} href="/dashboard">Dashboard</Link></li>
              <li><Link className={active("/profile")} href="/profile">โปรไฟล์ของฉัน</Link></li>
            </>
          )}
          {user?.role === "admin" && (
            <li><Link href="/admin/users">ผู้ดูแลระบบ</Link></li>
          )}
          {!user ? (
            <>
              <li><Link href="/login">เข้าสู่ระบบ</Link></li>
              <li><Link href="/register" className="btn-register">สมัครสมาชิก</Link></li>
            </>
          ) : (
            <>
              <li className="user-info">
                {user.name ?? "สมาชิก"} · {user.role === "admin" ? "Admin" : "Member"}
              </li>
              <li>
                <button type="button" className="btn-logout" onClick={() => signOut({ callbackUrl: "/" })}>
                  ออกจากระบบ
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
