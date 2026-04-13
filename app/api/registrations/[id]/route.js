import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  adminSessionCookieName,
  isValidAdminSessionToken
} from "@/lib/admin-auth";
import { updateRegistrationStatus } from "@/lib/registrations";

export async function PATCH(request, { params }) {
  const sessionToken = cookies().get(adminSessionCookieName)?.value;

  if (!isValidAdminSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const result = await updateRegistrationStatus(params.id, payload?.status);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ registration: result.registration });
}
