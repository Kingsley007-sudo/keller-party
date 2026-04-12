"use client";

import { startTransition, useState } from "react";

const eventDetails = [
  "Private event.",
  "Limited access.",
  "Dresscode: Elegant",
  "No photos. No videos.",
  "Entry: 15 CHF"
];

const initialForm = {
  fullName: "",
  phoneNumber: "",
  dateOfBirth: "",
  instagramName: ""
};

export default function HomePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;

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

    return nextErrors;
  }

  function openForm() {
    setIsSubmitted(false);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setIsSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    startTransition(() => {
      setErrors({});
      setIsSubmitted(true);
      setIsFormOpen(false);
      setFormData(initialForm);
    });
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-glow" />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Zurich After Dark</p>
          <p className="hero-kicker">Private invitation only</p>
          <h1>
            Exclusive by design.
            <span> Deliberate in every detail.</span>
          </h1>
          <p className="hero-description">
            A premium invitation layer for a tightly controlled guest list.
            Black glass, midnight blue light, and restrained gold accents.
          </p>
          <div className="hero-meta">
            <span>June 27</span>
            <span>23:00</span>
            <span>Icon Club Zurich</span>
          </div>
        </div>

        <div className="scene">
          <div className="halo-ring halo-ring-one" />
          <div className="halo-ring halo-ring-two" />
          <div className="card-frame">
            <div className="foil foil-top" />
            <div className="foil foil-side" />
            <div className="invite-card">
              <div className="card-topline">
                <p className="event-label">KELLER PARTY</p>
                <span className="status-pill">Private list</span>
              </div>
              <h2>June 27</h2>
              <p className="location">Icon Club Zurich</p>
              <ul className="details-list">
                {eventDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <button
                type="button"
                className="primary-button"
                onClick={openForm}
              >
                {isFormOpen ? "Form open" : "Request access"}
              </button>

              {isFormOpen ? (
                <form className="request-form inline-form" onSubmit={handleSubmit} noValidate>
                  <div className="form-header">
                    <div>
                      <p className="flow-label">Registration</p>
                      <h3>Request access</h3>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={closeForm}
                    >
                      Close
                    </button>
                  </div>

                  <p className="flow-intro">
                    Submit your details for review. You will be contacted via
                    WhatsApp regarding your status.
                  </p>

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

                  <button type="submit" className="primary-button">
                    Submit request
                  </button>
                </form>
              ) : null}

              {isSubmitted ? (
                <div className="success-card inline-success">
                  <div className="form-header">
                    <div>
                      <p className="flow-label">Submission received</p>
                      <h3>Your request is in review.</h3>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={closeForm}
                    >
                      Close
                    </button>
                  </div>
                  <p className="flow-intro">
                    You will be contacted via WhatsApp regarding your status.
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={openForm}
                  >
                    Send another request
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
