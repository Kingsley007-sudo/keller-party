import "server-only";
import { whatsappTemplateDefinitions } from "@/lib/whatsapp-copy";

const graphApiVersion = process.env.WHATSAPP_API_VERSION || "v25.0";
const defaultCountryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "41";

function normalizeRecipient(phoneNumber) {
  const rawPhoneNumber = typeof phoneNumber === "string" ? phoneNumber.trim() : "";

  if (!rawPhoneNumber) {
    return "";
  }

  if (rawPhoneNumber.startsWith("+")) {
    return rawPhoneNumber.replace(/[^\d]/g, "");
  }

  const digits = rawPhoneNumber.replace(/[^\d]/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  if (digits.startsWith("0")) {
    return `${defaultCountryCode}${digits.slice(1)}`;
  }

  return digits;
}

function getWhatsAppConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return null;
  }

  return {
    accessToken,
    phoneNumberId,
    languageCode: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US"
  };
}

function buildTextParameters(values) {
  return values.map((value) => ({
    type: "text",
    text: value == null ? "" : String(value)
  }));
}

export function isWhatsAppConfigured() {
  return Boolean(getWhatsAppConfig());
}

export async function sendWhatsAppTemplate({
  phoneNumber,
  templateName,
  parameters = []
}) {
  const config = getWhatsAppConfig();

  if (!config) {
    return {
      ok: false,
      skipped: true,
      error: "WhatsApp Cloud API is not configured."
    };
  }

  if (!templateName) {
    return {
      ok: false,
      skipped: true,
      error: "WhatsApp template name is not configured."
    };
  }

  const recipient = normalizeRecipient(phoneNumber);

  if (!recipient) {
    return {
      ok: false,
      skipped: true,
      error: "Recipient phone number is empty or invalid."
    };
  }

  const bodyParameters = buildTextParameters(parameters);
  const components =
    bodyParameters.length > 0
      ? [
          {
            type: "body",
            parameters: bodyParameters
          }
        ]
      : undefined;

  const response = await fetch(
    `https://graph.facebook.com/${graphApiVersion}/${config.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: config.languageCode
          },
          ...(components ? { components } : {})
        }
      })
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      skipped: false,
      error:
        payload?.error?.message ||
        `WhatsApp request failed with status ${response.status}.`
    };
  }

  return {
    ok: true,
    messageId: payload?.messages?.[0]?.id || ""
  };
}

export async function sendRegistrationReceivedMessage(registration) {
  return sendWhatsAppTemplate({
    phoneNumber: registration.phoneNumber,
    templateName:
      process.env.WHATSAPP_REQUEST_TEMPLATE_NAME ||
      whatsappTemplateDefinitions.requestReceived.name,
    parameters: [registration.fullName]
  });
}

export async function sendRegistrationAcceptedMessage(registration) {
  return sendWhatsAppTemplate({
    phoneNumber: registration.phoneNumber,
    templateName:
      process.env.WHATSAPP_ACCEPTED_TEMPLATE_NAME ||
      whatsappTemplateDefinitions.accepted.name,
    parameters: [registration.fullName]
  });
}

export async function sendRegistrationRejectedMessage(registration) {
  return sendWhatsAppTemplate({
    phoneNumber: registration.phoneNumber,
    templateName:
      process.env.WHATSAPP_REJECTED_TEMPLATE_NAME ||
      whatsappTemplateDefinitions.rejected.name,
    parameters: [registration.fullName]
  });
}
