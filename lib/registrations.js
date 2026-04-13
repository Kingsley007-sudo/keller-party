import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "registrations.json");

const validStatuses = new Set(["pending", "accepted", "rejected"]);

async function ensureDataFile() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(dataFile, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeFile(dataFile, "[]\n", "utf8");
      return;
    }

    throw error;
  }
}

async function readRegistrations() {
  await ensureDataFile();
  const content = await readFile(dataFile, "utf8");

  try {
    const registrations = JSON.parse(content);
    return Array.isArray(registrations) ? registrations : [];
  } catch {
    return [];
  }
}

async function writeRegistrations(registrations) {
  await ensureDataFile();
  await writeFile(dataFile, `${JSON.stringify(registrations, null, 2)}\n`, "utf8");
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeInstagram(value) {
  const handle = normalizeText(value);

  if (!handle) {
    return "";
  }

  return handle.startsWith("@") ? handle : `@${handle}`;
}

function normalizeGuests(guests) {
  if (!Array.isArray(guests)) {
    return [];
  }

  return guests
    .map((guest) => ({
      fullName: normalizeText(guest?.fullName),
      instagramName: normalizeInstagram(guest?.instagramName)
    }))
    .filter((guest) => guest.fullName || guest.instagramName);
}

export function validateRegistrationInput(input) {
  const payload = {
    fullName: normalizeText(input?.fullName),
    phoneNumber: normalizeText(input?.phoneNumber),
    dateOfBirth: normalizeText(input?.dateOfBirth),
    instagramName: normalizeInstagram(input?.instagramName),
    bringingGuests: input?.bringingGuests === "yes" ? "yes" : "no",
    guests: normalizeGuests(input?.guests)
  };

  const errors = {};

  if (!payload.fullName) {
    errors.fullName = "Full name is required.";
  }

  if (!payload.phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
  }

  if (!payload.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  }

  if (!payload.instagramName) {
    errors.instagramName = "Instagram name is required.";
  }

  if (input?.bringingGuests !== "yes" && input?.bringingGuests !== "no") {
    errors.bringingGuests = "Please confirm whether you are bringing guests.";
  }

  if (payload.bringingGuests === "yes") {
    if (payload.guests.length === 0) {
      errors.guests = [{ fullName: "Guest full name is required.", instagramName: "Guest Instagram name is required." }];
    } else {
      const guestErrors = payload.guests.map((guest) => {
        const guestError = {};

        if (!guest.fullName) {
          guestError.fullName = "Guest full name is required.";
        }

        if (!guest.instagramName) {
          guestError.instagramName = "Guest Instagram name is required.";
        }

        return guestError;
      });

      if (guestErrors.some((guestError) => Object.keys(guestError).length > 0)) {
        errors.guests = guestErrors;
      }
    }
  }

  return { payload, errors };
}

export async function listRegistrations() {
  const registrations = await readRegistrations();

  return registrations.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export async function createRegistration(input) {
  const { payload, errors } = validateRegistrationInput(input);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const timestamp = new Date().toISOString();
  const nextRegistration = {
    id: crypto.randomUUID(),
    ...payload,
    guests: payload.bringingGuests === "yes" ? payload.guests : [],
    status: "pending",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const registrations = await readRegistrations();
  registrations.push(nextRegistration);
  await writeRegistrations(registrations);

  return { ok: true, registration: nextRegistration };
}

export async function updateRegistrationStatus(id, status) {
  const nextStatus = normalizeText(status).toLowerCase();

  if (!validStatuses.has(nextStatus)) {
    return { ok: false, error: "Invalid status." };
  }

  const registrations = await readRegistrations();
  const registrationIndex = registrations.findIndex((registration) => registration.id === id);

  if (registrationIndex === -1) {
    return { ok: false, error: "Registration not found." };
  }

  const currentRegistration = registrations[registrationIndex];
  const updatedRegistration = {
    ...currentRegistration,
    status: nextStatus,
    updatedAt: new Date().toISOString()
  };

  registrations[registrationIndex] = updatedRegistration;
  await writeRegistrations(registrations);

  return { ok: true, registration: updatedRegistration };
}
