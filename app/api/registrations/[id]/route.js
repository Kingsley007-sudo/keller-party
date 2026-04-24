import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  adminSessionCookieName,
  isValidAdminSessionToken
} from "@/lib/admin-auth";
import { updateRegistrationStatus } from "@/lib/registrations";
import {
  sendRegistrationAcceptedMessage,
  sendRegistrationRejectedMessage
} from "@/lib/whatsapp";

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

  let messageResult = null;

  if (result.registration.status === "accepted") {
    messageResult = await sendRegistrationAcceptedMessage(result.registration);
  }

  if (result.registration.status === "rejected") {
    messageResult = await sendRegistrationRejectedMessage(result.registration);
  }

  const responsePayload = { registration: result.registration };

  if (messageResult && !messageResult.ok) {
    console.error("WhatsApp status message failed:", messageResult.error);
    responsePayload.messageWarning = messageResult.error;
  }

  return NextResponse.json(responsePayload);
}
