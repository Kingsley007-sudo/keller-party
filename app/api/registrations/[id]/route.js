import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  adminSessionCookieName,
  isValidAdminSessionToken
} from "@/lib/admin-auth";
import {
  updateRegistrationGuestStatus,
  updateRegistrationStatus
} from "@/lib/registrations";
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
  const result =
    payload?.guestIndex === undefined
      ? await updateRegistrationStatus(params.id, payload?.status)
      : await updateRegistrationGuestStatus(
          params.id,
          payload.guestIndex,
          payload?.status
        );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  let messageResult = null;
  const messageRecipient = result.guest
    ? {
        fullName: result.guest.fullName,
        phoneNumber: result.guest.phoneNumber
      }
    : result.registration;

  if (payload?.status === "accepted") {
    messageResult = await sendRegistrationAcceptedMessage(messageRecipient);
  }

  if (payload?.status === "rejected") {
    messageResult = await sendRegistrationRejectedMessage(messageRecipient);
  }

  const responsePayload = { registration: result.registration };

  if (messageResult && !messageResult.ok) {
    console.error("WhatsApp status message failed:", messageResult.error);
    responsePayload.messageWarning = messageResult.error;
  }

  return NextResponse.json(responsePayload);
}
