import InvitationEnvelope from "./invitation-envelope";

export default function HomePage() {
  return (
    <main className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-glow" />
      <section className="hero home-hero">
        <InvitationEnvelope />

        <div className="hero-meta">
          <span>June 27</span>
          <span>23:00</span>
          <span>Icon Club, St. Peterstrasse 1, 8001 Zurich</span>
        </div>
        <p className="hero-kicker hero-meta-kicker">Private invitation only</p>
      </section>
    </main>
  );
}
