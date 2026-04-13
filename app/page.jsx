import Link from "next/link";

const eventDetails = [
  "Private event.",
  "Limited access.",
  "Dresscode: Elegant",
  "No photos. No videos.",
  "Entry: 15 CHF"
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-glow" />
      <section className="hero home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Zurich After Dark</p>
          <p className="hero-kicker">Private invitation only</p>
        </div>

        <div className="scene">
          <div className="halo-ring halo-ring-one" />
          <div className="halo-ring halo-ring-two" />
          <div className="envelope-stage" aria-label="Keller Party invitation">
            <div className="envelope-back" />
            <div className="envelope-flap" />
            <div className="card-frame">
              <div className="foil foil-top" />
              <div className="foil foil-side" />
              <div className="invite-card">
                <div className="card-topline">
                  <p className="event-label">KELLER PARTY</p>
                  <span className="status-pill">Private list</span>
                </div>
                <h2>June 27</h2>
                <p className="location">
                  Icon Club, St. Peterstrasse 1, 8001 Zurich
                </p>
                <ul className="details-list">
                  {eventDetails.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <Link href="/request-access" className="primary-button button-link">
                  Request access
                </Link>
              </div>
            </div>
            <div className="envelope-pocket" />
          </div>
        </div>

        <div className="hero-meta">
          <span>June 27</span>
          <span>23:00</span>
          <span>Icon Club, St. Peterstrasse 1, 8001 Zurich</span>
        </div>
      </section>
    </main>
  );
}
