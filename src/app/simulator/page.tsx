"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Estimate = {
  min: number;
  max: number;
  currency: string;
  assumptions: { areaSqm: number; finishLevel: string };
};

const PROJECT_TYPES = [
  ["LOFT_CONVERSION", "Loft conversion"],
  ["EXTENSION", "Extension"],
  ["REFURBISHMENT", "Refurbishment"],
  ["ROOFING", "Roofing"],
  ["GROUNDWORKS", "Groundworks"],
  ["OTHER", "Other"],
] as const;

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

export default function SimulatorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEstimate(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const areaRaw = form.get("areaSqm") as string;
    const payload = {
      title: form.get("title"),
      projectType: form.get("projectType"),
      description: form.get("description") || undefined,
      contactName: form.get("contactName"),
      contactEmail: form.get("contactEmail"),
      contactPhone: form.get("contactPhone") || undefined,
      addressLine: form.get("addressLine") || undefined,
      postcode: form.get("postcode") || undefined,
      areaSqm: areaRaw ? Number(areaRaw) : undefined,
      finishLevel: form.get("finishLevel"),
    };

    const res = await fetch("/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (res.status === 401) {
      router.push("/login?next=/simulator");
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create quote");
      return;
    }
    const data = await res.json();
    setEstimate(data.estimate);
    setSavedId(data.simulation.id);
  }

  return (
    <main className="container">
      <section className="section">
        <h1 style={{ color: "var(--navy)" }}>Project quote simulator</h1>
        <p className="muted">
          Tell us about your project and get an instant ballpark estimate. We&apos;ll confirm the
          final figure after a site visit. You need an account so we can save your quote.
        </p>

        {error && <div className="error">{error}</div>}

        {estimate && (
          <div className="estimate">
            <div className="muted" style={{ color: "#c7d0e2" }}>Estimated project cost</div>
            <div className="band">
              {gbp(estimate.min)} – {gbp(estimate.max)}
            </div>
            <div style={{ color: "#c7d0e2", marginTop: 6 }}>
              Based on ~{estimate.assumptions.areaSqm} m² · {estimate.assumptions.finishLevel} finish
            </div>
            {savedId && (
              <div style={{ marginTop: 14 }}>
                <Link className="btn ghost" href={`/dashboard`}>
                  View in dashboard
                </Link>
              </div>
            )}
          </div>
        )}

        <form className="card" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
          <label htmlFor="title">Quote title</label>
          <input id="title" name="title" placeholder="e.g. Rear extension, Putney" required />

          <div className="row">
            <div>
              <label htmlFor="projectType">Project type</label>
              <select id="projectType" name="projectType" defaultValue="EXTENSION">
                {PROJECT_TYPES.map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="finishLevel">Finish level</label>
              <select id="finishLevel" name="finishLevel" defaultValue="STANDARD">
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
          </div>

          <label htmlFor="areaSqm">Approximate area (m²)</label>
          <input id="areaSqm" name="areaSqm" type="number" min="1" step="1" placeholder="e.g. 30" />

          <label htmlFor="description">Project details</label>
          <textarea id="description" name="description" rows={3} placeholder="Anything we should know?" />

          <h3 style={{ marginTop: 22, color: "var(--navy)" }}>Your details</h3>
          <div className="row">
            <div>
              <label htmlFor="contactName">Name</label>
              <input id="contactName" name="contactName" required />
            </div>
            <div>
              <label htmlFor="contactEmail">Email</label>
              <input id="contactEmail" name="contactEmail" type="email" required />
            </div>
          </div>
          <div className="row">
            <div>
              <label htmlFor="contactPhone">Phone</label>
              <input id="contactPhone" name="contactPhone" />
            </div>
            <div>
              <label htmlFor="postcode">Postcode</label>
              <input id="postcode" name="postcode" />
            </div>
          </div>
          <label htmlFor="addressLine">Address</label>
          <input id="addressLine" name="addressLine" />

          <button className="btn" type="submit" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? "Calculating…" : "Get my estimate"}
          </button>
        </form>
      </section>
    </main>
  );
}
