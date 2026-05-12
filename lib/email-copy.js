const eventName = "Keller Party";

function getFirstName(fullName) {
  const name = typeof fullName === "string" ? fullName.trim() : "";
  const nameParts = name.split(/\s+/).filter(Boolean);

  return nameParts.length > 0 ? nameParts[0] : "Guest";
}

export function buildRegistrationReceivedEmail(fullName) {
  const firstName = getFirstName(fullName);

  return {
    subject: `${eventName} access request received`,
    text: `Dear ${firstName},

Thank you for submitting your access request for Keller Party. We have received your registration and will review it shortly.
You will receive another email once a decision has been made.

Kind regards,
Keller Party Team`
  };
}

export function buildRegistrationAcceptedEmail(fullName) {
  const firstName = getFirstName(fullName);

  return {
    subject: `${eventName} access approved`,
    text: `Dear ${firstName},

Your Keller Party access request has been approved.

The party starts at 23:00 ock, so please be punctual.

Please provide your name at the door when you arrive. Entry is 15 CHF and must be paid at the door by TWINT or card.

Photography is prohibited.
Videography is prohibited.
This is a private event. Your invitation is personal and non-transferable.

Kind regards,
Keller Party Team`
  };
}

export function buildRegistrationRejectedEmail(fullName) {
  const firstName = getFirstName(fullName);

  return {
    subject: `${eventName} access request update`,
    text: `Dear ${firstName},

Thank you for your interest in Keller Party. We are unable to approve your access request at this time.

Kind regards,
Keller Party Team`
  };
}
