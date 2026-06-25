import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireMember() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireMember();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}
