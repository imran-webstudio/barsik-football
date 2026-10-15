import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { env } from "~/env";

const COOKIE = "barsik_admin";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

function sign(payload: string) {
  return createHmac("sha256", env.AUTH_SECRET).update(payload).digest("base64url");
}

export function createAdminToken() {
  const payload = `admin.${Date.now() + MAX_AGE_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, exp, sig] = parts as [string, string, string];
  if (role !== "admin") return false;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;

  const payload = `${role}.${exp}`;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function tokenFromCookieHeader(header: string | null) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function isAdminRequest() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(COOKIE)?.value);
}

export const adminCookie = {
  name: COOKIE,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_MS / 1000,
  },
};

export function passwordsMatch(input: string, expected: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
