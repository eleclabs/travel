// src/actions/auth.action.ts
"use server";

import { registerUser, createResetToken } from "@/services/auth.service";

export async function registerAction(formData: FormData) {
  await registerUser({
    name: String(formData.get("name")),
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
}

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email"));
  const token = await createResetToken(email);

  console.log("Reset link:", `/reset-password/${token}`);
}