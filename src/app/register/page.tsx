"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create account");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="container">
      <form className="form" onSubmit={onSubmit}>
        <h1>Create your account</h1>
        <p className="muted">Save quotes and track your project with SISOL.</p>
        {error && <div className="error">{error}</div>}

        <label htmlFor="name">Full name</label>
        <input id="name" name="name" autoComplete="name" />

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" name="phone" autoComplete="tel" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />

        <button className="btn" type="submit" disabled={loading} style={{ marginTop: 18, width: "100%" }}>
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="muted" style={{ marginTop: 14 }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
