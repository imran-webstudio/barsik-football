"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "~/env";
import { adminCookie, createAdminToken, passwordsMatch } from "~/server/admin";

export async function loginAdmin(formData: FormData) {
  const passwordField = formData.get("password");
  const password = typeof passwordField === "string" ? passwordField : "";
  if (!passwordsMatch(password, env.ADMIN_PASSWORD)) {
    redirect("/dashboard/login?error=1");
  }

  const jar = await cookies();
  jar.set(adminCookie.name, createAdminToken(), adminCookie.options);
  redirect("/dashboard");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(adminCookie.name);
  redirect("/dashboard/login");
}
