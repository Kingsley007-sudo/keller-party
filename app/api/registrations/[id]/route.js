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
} from "@/lib/email";

const statusMessageSenders = {
  accepted: sendRegistrationAcceptedMessage,
  rejected: sendRegistrationRejectedMessage
};

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

  const messageRecipient = result.guest
    ? {
        fullName: result.guest.fullName,
        email: result.guest.email
      }
    : result.registration;
  const sendStatusMessage = statusMessageSenders[payload?.status];
  const messageResult = sendStatusMessage
    ? await sendStatusMessage(messageRecipient)
    : null;

  const responsePayload = { registration: result.registration };

  if (messageResult && !messageResult.ok) {
    console.error("Status email failed:", messageResult.error);
    responsePayload.messageWarning = messageResult.error;
  }

  if (messageResult?.ok) {
    console.info("Status email accepted:", {
      messageId: messageResult.messageId
    });

    if (process.env.NODE_ENV !== "production") {
      responsePayload.messageDebug = {
        messageId: messageResult.messageId
      };
    }
  }

  return NextResponse.json(responsePayload);
}
