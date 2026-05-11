import "server-only";
import nodemailer from "nodemailer";
import {
  buildRegistrationAcceptedEmail,
  buildRegistrationReceivedEmail,
  buildRegistrationRejectedEmail
} from "@/lib/email-copy";

function getEnvValue(name) {
  return typeof process.env[name] === "string" ? process.env[name].trim() : "";
}

function getEmailConfig() {
  const host = getEnvValue("SMTP_HOST");
  const port = Number(getEnvValue("SMTP_PORT") || 465);
  const user = getEnvValue("SMTP_USER");
  const password = getEnvValue("SMTP_PASSWORD");
  const from = getEnvValue("EMAIL_FROM");
  const secureValue = getEnvValue("SMTP_SECURE").toLowerCase();

  if (!host || !port || !user || !password || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: secureValue ? secureValue === "true" : port === 465,
    user,
    password,
    from,
    replyTo: getEnvValue("EMAIL_REPLY_TO")
  };
}

function getRecipientEmail(registration) {
  return typeof registration?.email === "string" ? registration.email.trim() : "";
}

function textToHtml(text) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

export function isEmailConfigured() {
  return Boolean(getEmailConfig());
}

export async function sendEmail({ to, subject, text }) {
  const config = getEmailConfig();

  if (!config) {
    return {
      ok: false,
      skipped: true,
      error:
        "Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM."
    };
  }

  if (!to) {
    return {
      ok: false,
      skipped: true,
      error: "Recipient email address is empty or invalid."
    };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password
    }
  });

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
      html: textToHtml(text),
      ...(config.replyTo ? { replyTo: config.replyTo } : {})
    });

    return {
      ok: true,
      messageId: info.messageId || ""
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      error: error instanceof Error ? error.message : "SMTP email request failed."
    };
  }
}

export function getEmailDiagnostics() {
  return {
    smtpHostConfigured: Boolean(getEnvValue("SMTP_HOST")),
    smtpPortConfigured: Boolean(getEnvValue("SMTP_PORT")),
    smtpUserConfigured: Boolean(getEnvValue("SMTP_USER")),
    smtpPasswordConfigured: Boolean(getEnvValue("SMTP_PASSWORD")),
    emailFromConfigured: Boolean(getEnvValue("EMAIL_FROM")),
    emailReplyToConfigured: Boolean(getEnvValue("EMAIL_REPLY_TO")),
    configured: isEmailConfigured()
  };
}

export async function sendRegistrationReceivedMessage(registration) {
  const message = buildRegistrationReceivedEmail(registration.fullName);

  return sendEmail({
    to: getRecipientEmail(registration),
    ...message
  });
}

export async function sendRegistrationAcceptedMessage(registration) {
  const message = buildRegistrationAcceptedEmail(registration.fullName);

  return sendEmail({
    to: getRecipientEmail(registration),
    ...message
  });
}

export async function sendRegistrationRejectedMessage(registration) {
  const message = buildRegistrationRejectedEmail(registration.fullName);

  return sendEmail({
    to: getRecipientEmail(registration),
    ...message
  });
}
