"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not sign in");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="container">
      <form className="form" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        {error && <div className="error">{error}</div>}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />

        <button className="btn" type="submit" disabled={loading} style={{ marginTop: 18, width: "100%" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted" style={{ marginTop: 14 }}>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
