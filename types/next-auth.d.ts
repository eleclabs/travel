import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: "member" | "admin";
    isEmailVerified: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "member" | "admin";
      isEmailVerified: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "member" | "admin";
    isEmailVerified?: boolean;
  }
}
