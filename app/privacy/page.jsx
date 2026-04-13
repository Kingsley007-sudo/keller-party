import Link from "next/link";

const privacySections = [
  {
    title: "What we collect",
    body: "When you request access, Keller Party stores your full name, phone number, date of birth, Instagram name, guest details if provided, submission time, and review status."
  },
  {
    title: "Why we collect it",
    body: "The information is used only to review access requests, manage the guest list, prevent duplicate submissions, and contact selected guests about this private event."
  },
  {
    title: "Who can access it",
    body: "Registration data is visible only inside the password-protected admin area. Data is stored in Supabase and is not published publicly."
  },
  {
    title: "How long we keep it",
    body: "Registration data should be deleted after the event is complete and no longer needed for guest-list operations."
  },
  {
    title: "WhatsApp contact",
    body: "If your request is accepted, the team may contact you manually via WhatsApp using the phone number you submitted."
  }
];

export const metadata = {
  title: "Keller Party Privacy",
  description: "Privacy information for Keller Party registration requests."
};

export default function PrivacyPage() {
  return (
    <main className="app-shell request-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-glow" />

      <section className="privacy-layout">
        <div className="request-copy">
          <p className="eyebrow">Privacy</p>
          <h1>Data notice.</h1>
          <p className="hero-description">
            This page explains how registration information is used for Keller Party access requests.
          </p>
          <div className="request-actions">
            <Link href="/request-access" className="secondary-button button-link">
              Back to request form
            </Link>
            <Link href="/" className="secondary-button button-link">
              Back to invite
            </Link>
          </div>
        </div>

        <div className="privacy-card">
          {privacySections.map((section) => (
            <section key={section.title} className="privacy-section">
              <p className="flow-label">{section.title}</p>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
