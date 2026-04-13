import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  adminSessionCookieName,
  isValidAdminSessionToken
} from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRegistration, listRegistrations } from "@/lib/registrations";

const submissionRateLimit = {
  limit: 5,
  windowMs: 60 * 60 * 1000
};

function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export async function GET() {
  const sessionToken = cookies().get(adminSessionCookieName)?.value;

  if (!isValidAdminSessionToken(sessionToken)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const registrations = await listRegistrations();
  return NextResponse.json({ registrations });
}

export async function POST(request) {
  const rateLimit = checkRateLimit(`registration:${getClientIp(request)}`, submissionRateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        errors: {
          form: "Too many requests. Please try again later."
        }
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  const payload = await request.json();
  const result = await createRegistration(payload);

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return NextResponse.json({ registration: result.registration }, { status: 201 });
}
