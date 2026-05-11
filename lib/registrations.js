import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase";

const validStatuses = new Set(["pending", "accepted", "rejected"]);

function mapRegistrationRow(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    email: row.email,
    dateOfBirth: row.date_of_birth,
    instagramName: row.instagram_name,
    bringingGuests: row.bringing_guests,
    guests: Array.isArray(row.guests) ? row.guests : [],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhoneForDuplicateCheck(value) {
  const phoneNumber = normalizeText(value);

  if (!phoneNumber) {
    return "";
  }

  if (phoneNumber.startsWith("+")) {
    return phoneNumber.replace(/[^\d]/g, "");
  }

  const digits = phoneNumber.replace(/[^\d]/g, "");

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  if (digits.startsWith("0")) {
    return `41${digits.slice(1)}`;
  }

  return digits;
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
      phoneNumber: normalizeText(guest?.phoneNumber),
      email: normalizeEmail(guest?.email),
      dateOfBirth: normalizeText(guest?.dateOfBirth),
      instagramName: normalizeInstagram(guest?.instagramName)
    }))
    .filter(
      (guest) =>
        guest.fullName ||
        guest.phoneNumber ||
        guest.email ||
        guest.dateOfBirth ||
        guest.instagramName
    )
    .map((guest) => ({
      ...guest,
      status: validStatuses.has(normalizeText(guest.status).toLowerCase())
        ? normalizeText(guest.status).toLowerCase()
        : "pending"
    }));
}

export function validateRegistrationInput(input) {
  const payload = {
    fullName: normalizeText(input?.fullName),
    phoneNumber: normalizeText(input?.phoneNumber),
    email: normalizeEmail(input?.email),
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

  if (!payload.email) {
    errors.email = "Email address is required.";
  } else if (!isValidEmail(payload.email)) {
    errors.email = "Enter a valid email address.";
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
      errors.guests = [
        {
          fullName: "Guest full name is required.",
          phoneNumber: "Guest phone number is required.",
          email: "Guest email address is required.",
          dateOfBirth: "Guest date of birth is required.",
          instagramName: "Guest Instagram name is required."
        }
      ];
    } else {
      const guestErrors = payload.guests.map((guest) => {
        const guestError = {};

        if (!guest.fullName) {
          guestError.fullName = "Guest full name is required.";
        }

        if (!guest.phoneNumber) {
          guestError.phoneNumber = "Guest phone number is required.";
        }

        if (!guest.email) {
          guestError.email = "Guest email address is required.";
        } else if (!isValidEmail(guest.email)) {
          guestError.email = "Enter a valid guest email address.";
        }

        if (!guest.dateOfBirth) {
          guestError.dateOfBirth = "Guest date of birth is required.";
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
  const { data, error } = await getSupabaseAdminClient()
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load registrations: ${error.message}`);
  }

  return data.map(mapRegistrationRow);
}

export async function createRegistration(input) {
  const { payload, errors } = validateRegistrationInput(input);

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const normalizedPhoneNumber = normalizePhoneForDuplicateCheck(payload.phoneNumber);
  const supabase = getSupabaseAdminClient();
  const { data: duplicateRegistrations, error: duplicateError } = await supabase
    .from("registrations")
    .select("id, phone_number, instagram_name")
    .or(
      `phone_number_normalized.eq.${normalizedPhoneNumber},instagram_name_normalized.eq.${payload.instagramName.toLowerCase()}`
    )
    .limit(1);

  if (duplicateError) {
    return {
      ok: false,
      errors: {
        form: `Your request could not be checked: ${duplicateError.message}`
      }
    };
  }

  if (duplicateRegistrations.length > 0) {
    const duplicateRegistration = duplicateRegistrations[0];

    if (
      normalizePhoneForDuplicateCheck(duplicateRegistration.phone_number) ===
      normalizedPhoneNumber
    ) {
      return {
        ok: false,
        errors: {
          phoneNumber: "This phone number has already submitted a request."
        }
      };
    }

    return {
      ok: false,
      errors: {
        instagramName: "This Instagram name has already submitted a request."
      }
    };
  }

  const timestamp = new Date().toISOString();
  const registration = {
    id: crypto.randomUUID(),
    full_name: payload.fullName,
    phone_number: payload.phoneNumber,
    phone_number_normalized: normalizedPhoneNumber,
    email: payload.email,
    date_of_birth: payload.dateOfBirth,
    instagram_name: payload.instagramName,
    instagram_name_normalized: payload.instagramName.toLowerCase(),
    bringing_guests: payload.bringingGuests,
    guests: payload.bringingGuests === "yes" ? payload.guests : [],
    status: "pending",
    created_at: timestamp,
    updated_at: timestamp
  };

  const { data, error } = await supabase
    .from("registrations")
    .insert(registration)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        errors: {
          form: "This request appears to have already been submitted."
        }
      };
    }

    return {
      ok: false,
      errors: {
        form: `Your request could not be saved: ${error.message}`
      }
    };
  }

  return { ok: true, registration: mapRegistrationRow(data) };
}

export async function updateRegistrationStatus(id, status) {
  const nextStatus = normalizeText(status).toLowerCase();

  if (!validStatuses.has(nextStatus)) {
    return { ok: false, error: "Invalid status." };
  }

  const { data, error } = await getSupabaseAdminClient()
    .from("registrations")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: error.code === "PGRST116" ? "Registration not found." : error.message
    };
  }

  return { ok: true, registration: mapRegistrationRow(data) };
}

export async function updateRegistrationGuestStatus(id, guestIndex, status) {
  const nextStatus = normalizeText(status).toLowerCase();

  if (!validStatuses.has(nextStatus)) {
    return { ok: false, error: "Invalid status." };
  }

  const numericGuestIndex = Number(guestIndex);

  if (!Number.isInteger(numericGuestIndex) || numericGuestIndex < 0) {
    return { ok: false, error: "Invalid guest index." };
  }

  const supabase = getSupabaseAdminClient();
  const { data: existingRegistration, error: loadError } = await supabase
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();

  if (loadError) {
    return {
      ok: false,
      error: loadError.code === "PGRST116" ? "Registration not found." : loadError.message
    };
  }

  const guests = Array.isArray(existingRegistration.guests)
    ? existingRegistration.guests
    : [];

  if (!guests[numericGuestIndex]) {
    return { ok: false, error: "Guest not found." };
  }

  const nextGuests = guests.map((guest, index) =>
    index === numericGuestIndex
      ? {
          ...guest,
          status: nextStatus
        }
      : guest
  );

  const { data, error } = await supabase
    .from("registrations")
    .update({
      guests: nextGuests,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: error.code === "PGRST116" ? "Registration not found." : error.message
    };
  }

  return {
    ok: true,
    registration: mapRegistrationRow(data),
    guest: nextGuests[numericGuestIndex]
  };
}
