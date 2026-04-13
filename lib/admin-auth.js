import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

export const adminSessionCookieName = "keller_admin_session";

function hashValue(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "keller-party-admin";
}

export function createAdminSessionToken() {
  return hashValue(getAdminPassword());
}

export function isValidAdminSessionToken(token) {
  if (!token) {
    return false;
  }

  const expected = Buffer.from(createAdminSessionToken());
  const received = Buffer.from(String(token));

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
