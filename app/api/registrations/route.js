import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  adminSessionCookieName,
  isValidAdminSessionToken
} from "@/lib/admin-auth";
import { createRegistration, listRegistrations } from "@/lib/registrations";

export async function GET() {
  const sessionToken = cookies().get(adminSessionCookieName)?.value;

  if (!isValidAdminSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const registrations = await listRegistrations();
  return NextResponse.json({ registrations });
}

export async function POST(request) {
  const payload = await request.json();
  const result = await createRegistration(payload);

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return NextResponse.json({ registration: result.registration }, { status: 201 });
}
