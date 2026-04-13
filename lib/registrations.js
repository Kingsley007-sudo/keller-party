import "server-only";
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "registrations.json");
const databaseFile = path.join(dataDirectory, "keller-party.sqlite");

const validStatuses = new Set(["pending", "accepted", "rejected"]);

let database;

function readLegacyRegistrations() {
  try {
    if (!existsSync(dataFile)) {
      return [];
    }

    const content = readFileSync(dataFile, "utf8");
    const registrations = JSON.parse(content);
    return Array.isArray(registrations) ? registrations : [];
  } catch {
    return [];
  }
}

function serializeGuests(guests) {
  return JSON.stringify(Array.isArray(guests) ? guests : []);
}

function deserializeGuests(guests) {
  try {
    const parsedGuests = JSON.parse(guests);
    return Array.isArray(parsedGuests) ? parsedGuests : [];
  } catch {
    return [];
  }
}

function mapRegistrationRow(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    dateOfBirth: row.date_of_birth,
    instagramName: row.instagram_name,
    bringingGuests: row.bringing_guests,
    guests: deserializeGuests(row.guests),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getDatabase() {
  if (database) {
    return database;
  }

  mkdirSync(dataDirectory, { recursive: true });
  database = new Database(databaseFile);
  database.pragma("journal_mode = WAL");

  database.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      instagram_name TEXT NOT NULL,
      bringing_guests TEXT NOT NULL DEFAULT 'no',
      guests TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS registrations_status_idx
      ON registrations (status);

    CREATE INDEX IF NOT EXISTS registrations_created_at_idx
      ON registrations (created_at DESC);
  `);

  migrateLegacyJsonRegistrations(database);

  return database;
}

function migrateLegacyJsonRegistrations(db) {
  const migrationKey = "legacy_json_registrations_v1";

  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const existingMigration = db
    .prepare("SELECT value FROM app_meta WHERE key = ?")
    .get(migrationKey);

  if (existingMigration) {
    return;
  }

  const legacyRegistrations = readLegacyRegistrations();
  const insertRegistration = db.prepare(`
    INSERT OR IGNORE INTO registrations (
      id,
      full_name,
      phone_number,
      date_of_birth,
      instagram_name,
      bringing_guests,
      guests,
      status,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @fullName,
      @phoneNumber,
      @dateOfBirth,
      @instagramName,
      @bringingGuests,
      @guests,
      @status,
      @createdAt,
      @updatedAt
    )
  `);

  const migrate = db.transaction(() => {
    for (const registration of legacyRegistrations) {
      insertRegistration.run({
        id: registration.id || crypto.randomUUID(),
        fullName: registration.fullName || "",
        phoneNumber: registration.phoneNumber || "",
        dateOfBirth: registration.dateOfBirth || "",
        instagramName: registration.instagramName || "",
        bringingGuests: registration.bringingGuests === "yes" ? "yes" : "no",
        guests: serializeGuests(registration.guests),
        status: validStatuses.has(registration.status) ? registration.status : "pending",
        createdAt: registration.createdAt || new Date().toISOString(),
        updatedAt: registration.updatedAt || registration.createdAt || new Date().toISOString()
      });
    }

    db.prepare("INSERT INTO app_meta (key, value) VALUES (?, ?)").run(
      migrationKey,
      new Date().toISOString()
    );
  });

  migrate();
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
  const registrations = getDatabase()
    .prepare("SELECT * FROM registrations ORDER BY datetime(created_at) DESC")
    .all()
    .map(mapRegistrationRow);

  return registrations;
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

  getDatabase()
    .prepare(`
      INSERT INTO registrations (
        id,
        full_name,
        phone_number,
        date_of_birth,
        instagram_name,
        bringing_guests,
        guests,
        status,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @fullName,
        @phoneNumber,
        @dateOfBirth,
        @instagramName,
        @bringingGuests,
        @guests,
        @status,
        @createdAt,
        @updatedAt
      )
    `)
    .run({
      ...nextRegistration,
      guests: serializeGuests(nextRegistration.guests)
    });

  return { ok: true, registration: nextRegistration };
}

export async function updateRegistrationStatus(id, status) {
  const nextStatus = normalizeText(status).toLowerCase();

  if (!validStatuses.has(nextStatus)) {
    return { ok: false, error: "Invalid status." };
  }

  const db = getDatabase();
  const currentRegistration = db
    .prepare("SELECT * FROM registrations WHERE id = ?")
    .get(id);

  if (!currentRegistration) {
    return { ok: false, error: "Registration not found." };
  }

  const updatedAt = new Date().toISOString();

  db.prepare("UPDATE registrations SET status = ?, updated_at = ? WHERE id = ?").run(
    nextStatus,
    updatedAt,
    id
  );

  const updatedRegistration = db
    .prepare("SELECT * FROM registrations WHERE id = ?")
    .get(id);

  return { ok: true, registration: mapRegistrationRow(updatedRegistration) };
}
