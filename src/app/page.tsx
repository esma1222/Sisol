import Link from "next/link";

const SERVICES = [
  { title: "Loft Conversions", body: "Add a room and value with a fully managed loft conversion." },
  { title: "Extensions", body: "Single and double-storey extensions built to last." },
  { title: "Refurbishments", body: "Full property refurbishments, inside and out." },
  { title: "Roofing", body: "Repairs, re-roofs and flat roofing systems." },
  { title: "Groundworks", body: "Foundations, drainage and structural groundworks." },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>London&apos;s Trusted Construction Partner</h1>
          <p>
            From loft conversions and extensions to full refurbishments, roofing and groundworks —
            SISOL Construction delivers quality craftsmanship backed by over a decade of experience.
          </p>
          <div style={{ marginTop: 26, display: "flex", gap: 12 }}>
            <Link className="btn" href="/simulator">
              Get an instant quote
            </Link>
            <Link className="btn secondary" href="/register">
              Create an account
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ color: "var(--navy)" }}>A complete range of construction services</h2>
          <div className="grid" style={{ marginTop: 20 }}>
            {SERVICES.map((s) => (
              <div className="card" key={s.title}>
                <h3>{s.title}</h3>
                <p className="muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h3>Ready to start your project?</h3>
              <p className="muted" style={{ margin: 0 }}>
                Use the simulator to get a ballpark figure in seconds, then save and compare quotes.
              </p>
            </div>
            <Link className="btn" href="/simulator">
              Start a quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
