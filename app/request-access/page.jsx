"use client";

import Link from "next/link";
import { startTransition, useState } from "react";

const initialForm = {
  fullName: "",
  phoneNumber: "",
  dateOfBirth: "",
  instagramName: "",
  bringingGuests: "",
  guests: []
};

export default function RequestAccessPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialForm);
  const [submissionError, setSubmissionError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "bringingGuests") {
      setFormData((current) => ({
        ...current,
        bringingGuests: value,
        guests: value === "yes" && current.guests.length === 0
          ? [{ fullName: "", instagramName: "" }]
          : value === "no"
            ? []
            : current.guests
      }));

      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors.bringingGuests;
        delete nextErrors.guests;
        return nextErrors;
      });

      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Phone number is required.";
    }

    if (!formData.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    }

    if (!formData.instagramName.trim()) {
      nextErrors.instagramName = "Instagram name is required.";
    }

    if (!formData.bringingGuests) {
      nextErrors.bringingGuests = "Please confirm whether you are bringing guests.";
    }

    if (formData.bringingGuests === "yes") {
      const guestErrors = formData.guests.map((guest) => {
        const nextGuestErrors = {};

        if (!guest.fullName.trim()) {
          nextGuestErrors.fullName = "Guest full name is required.";
        }

        if (!guest.instagramName.trim()) {
          nextGuestErrors.instagramName = "Guest Instagram name is required.";
        }

        return nextGuestErrors;
      });

      if (guestErrors.some((guestError) => Object.keys(guestError).length > 0)) {
        nextErrors.guests = guestErrors;
      }
    }

    return nextErrors;
  }

  function handleGuestChange(index, field, value) {
    setFormData((current) => ({
      ...current,
      guests: current.guests.map((guest, guestIndex) =>
        guestIndex === index ? { ...guest, [field]: value } : guest
      )
    }));

    setErrors((current) => {
      if (!Array.isArray(current.guests) || !current.guests[index]?.[field]) {
        return current;
      }

      const nextGuestErrors = current.guests.map((guestError, guestIndex) =>
        guestIndex === index ? { ...guestError, [field]: undefined } : guestError
      );

      const normalizedGuestErrors = nextGuestErrors.map((guestError) => {
        const cleanedGuestError = { ...guestError };
        Object.keys(cleanedGuestError).forEach((key) => {
          if (!cleanedGuestError[key]) {
            delete cleanedGuestError[key];
          }
        });
        return cleanedGuestError;
      });

      const nextErrors = { ...current };

      if (normalizedGuestErrors.some((guestError) => Object.keys(guestError).length > 0)) {
        nextErrors.guests = normalizedGuestErrors;
      } else {
        delete nextErrors.guests;
      }

      return nextErrors;
    });
  }

  function addGuest() {
    setFormData((current) => ({
      ...current,
      guests: [...current.guests, { fullName: "", instagramName: "" }]
    }));
  }

  function removeGuest(index) {
    setFormData((current) => ({
      ...current,
      guests: current.guests.filter((_, guestIndex) => guestIndex !== index)
    }));

    setErrors((current) => {
      if (!Array.isArray(current.guests)) {
        return current;
      }

      const nextErrors = { ...current };
      const nextGuestErrors = current.guests.filter((_, guestIndex) => guestIndex !== index);

      if (nextGuestErrors.length > 0) {
        nextErrors.guests = nextGuestErrors;
      } else {
        delete nextErrors.guests;
      }

      return nextErrors;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    void submitForm();
  }

  async function submitForm() {
    setSubmissionError("");

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const payload = await response.json();

    if (!response.ok) {
      setIsSubmitting(false);
      setErrors(payload.errors || {});
      setSubmissionError("Your request could not be submitted. Please review the form and try again.");
      return;
    }

    startTransition(() => {
      setErrors({});
      setSubmissionError("");
      setIsSubmitted(true);
      setFormData(initialForm);
      setIsSubmitting(false);
    });
  }

  function resetForm() {
    setErrors({});
    setIsSubmitted(false);
    setFormData(initialForm);
    setSubmissionError("");
  }

  return (
    <main className="app-shell request-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-glow" />

      <section className="request-layout">
        <div className="request-copy">
          <p className="eyebrow">Keller Party</p>
          <h1>{isSubmitted ? "Submission received." : "Request access."}</h1>
          <p className="hero-description">
            {isSubmitted
              ? "Your request is now in review. You will be contacted via WhatsApp regarding your status."
              : "Complete the registration form as a separate step. This page is intentionally isolated from the invitation card."}
          </p>
          <div className="request-actions">
            <Link href="/" className="secondary-button button-link">
              Back to invite
            </Link>
            {isSubmitted ? (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Submit another
              </button>
            ) : null}
          </div>
        </div>

        <div className="request-card">
          {isSubmitted ? (
            <div className="success-card">
              <p className="flow-label">Submission received</p>
              <h3>Your request is in review.</h3>
              <p className="flow-intro">
                You will be contacted via WhatsApp regarding your status.
              </p>
            </div>
          ) : (
            <form className="request-form" onSubmit={handleSubmit} noValidate>
              <div className="form-header">
                <div>
                  <p className="flow-label">Registration</p>
                  <h3>Request access</h3>
                </div>
              </div>

              <label className="field">
                <span>Full name</span>
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
                {errors.fullName ? (
                  <span className="field-error">{errors.fullName}</span>
                ) : null}
              </label>

              <label className="field">
                <span>Phone number</span>
                <input
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+41 ..."
                />
                {errors.phoneNumber ? (
                  <span className="field-error">{errors.phoneNumber}</span>
                ) : null}
              </label>

              <label className="field">
                <span>Date of birth</span>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {errors.dateOfBirth ? (
                  <span className="field-error">{errors.dateOfBirth}</span>
                ) : null}
              </label>

              <label className="field">
                <span>Instagram name</span>
                <input
                  name="instagramName"
                  type="text"
                  value={formData.instagramName}
                  onChange={handleChange}
                  placeholder="@yourhandle"
                />
                {errors.instagramName ? (
                  <span className="field-error">{errors.instagramName}</span>
                ) : null}
              </label>

              <fieldset className="field-group">
                <legend>Will you be coming with guests?</legend>
                <div className="choice-row">
                  <label className="choice-pill">
                    <input
                      name="bringingGuests"
                      type="radio"
                      value="no"
                      checked={formData.bringingGuests === "no"}
                      onChange={handleChange}
                    />
                    <span>No</span>
                  </label>
                  <label className="choice-pill">
                    <input
                      name="bringingGuests"
                      type="radio"
                      value="yes"
                      checked={formData.bringingGuests === "yes"}
                      onChange={handleChange}
                    />
                    <span>Yes</span>
                  </label>
                </div>
                {errors.bringingGuests ? (
                  <span className="field-error">{errors.bringingGuests}</span>
                ) : null}
              </fieldset>

              {formData.bringingGuests === "yes" ? (
                <div className="guest-list">
                  {formData.guests.map((guest, index) => (
                    <div key={`guest-${index}`} className="guest-card">
                      <div className="guest-card-header">
                        <p className="flow-label">Guest {index + 1}</p>
                        {formData.guests.length > 1 ? (
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => removeGuest(index)}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>

                      <label className="field">
                        <span>Guest full name</span>
                        <input
                          type="text"
                          value={guest.fullName}
                          onChange={(event) =>
                            handleGuestChange(index, "fullName", event.target.value)
                          }
                          placeholder="Guest full name"
                        />
                        {errors.guests?.[index]?.fullName ? (
                          <span className="field-error">
                            {errors.guests[index].fullName}
                          </span>
                        ) : null}
                      </label>

                      <label className="field">
                        <span>Guest Instagram name</span>
                        <input
                          type="text"
                          value={guest.instagramName}
                          onChange={(event) =>
                            handleGuestChange(index, "instagramName", event.target.value)
                          }
                          placeholder="@guesthandle"
                        />
                        {errors.guests?.[index]?.instagramName ? (
                          <span className="field-error">
                            {errors.guests[index].instagramName}
                          </span>
                        ) : null}
                      </label>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={addGuest}
                  >
                    Add guest
                  </button>
                </div>
              ) : null}

              {submissionError ? (
                <p className="field-error form-error-banner">{submissionError}</p>
              ) : null}

              <p className="privacy-note">
                By submitting this request, you agree that Keller Party may store
                your registration details and use your phone number or Instagram
                name to review access and contact you about this private event.
                {" "}
                <Link href="/privacy">Read the privacy notice.</Link>
              </p>

              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit request"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
