import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const adminSessionCookieName = "keller_admin_session";
export const adminSessionDurationSeconds = 60 * 60 * 12;

function signValue(value) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "keller-party-admin";
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || getAdminPassword();
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + adminSessionDurationSeconds * 1000;
  const payload = String(expiresAt);
  const signature = signValue(payload);

  return `${payload}.${signature}`;
}

export function isValidAdminSessionToken(token) {
  if (!token) {
    return false;
  }

  const [expiresAt, signature] = String(token).split(".");

  if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) {
    return false;
  }

  const expected = Buffer.from(signValue(expiresAt));
  const received = Buffer.from(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export function isValidAdminPassword(password) {
  if (!password) {
    return false;
  }

  const expected = Buffer.from(getAdminPassword());
  const received = Buffer.from(String(password));

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}
