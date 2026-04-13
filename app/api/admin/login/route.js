import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  createAdminSessionToken,
  isValidAdminPassword
} from "@/lib/admin-auth";

export async function POST(request) {
  const payload = await request.json();
  const password = payload?.password;

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: adminSessionCookieName,
    value: createAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
