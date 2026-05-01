export const whatsappTemplateDefinitions = {
  requestReceived: {
    name: "keller_party_request_received",
    body:
      "Hi {{1}}, your Keller Party access request has been received. We will review it shortly."
  },
  accepted: {
    name: "keller_party_access_approved",
    body: `KELLER PARTY

Hi {{1}},
You have been selected.
We look forward to welcoming you to the Icon Club Zurich on June 27.
Please arrive promptly at 23:00.
The dress code is Elegant and will be strictly enforced.
Photography Prohibited.
Videography Prohibited.
Entry is 15 CHF and must be paid at the door by TWINT or card.
This is a private event. Your invitation is personal and non-transferable.`
  },
  rejected: {
    name: "keller_party_access_rejected",
    body:
      "Hi {{1}}, thank you for your Keller Party attendance request. We are unable to approve this request."
  }
};

function fillGuestName(templateBody, fullName) {
  const guestName = fullName || "there";
  return templateBody.replace("{{1}}", guestName);
}

export function buildRequestReceivedWhatsAppMessage(fullName) {
  return fillGuestName(whatsappTemplateDefinitions.requestReceived.body, fullName);
}

export function buildAcceptedWhatsAppMessage(fullName) {
  return fillGuestName(whatsappTemplateDefinitions.accepted.body, fullName);
}

export function buildRejectedWhatsAppMessage(fullName) {
  return fillGuestName(whatsappTemplateDefinitions.rejected.body, fullName);
}
