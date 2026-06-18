"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="btn ghost"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}

export function SaveQuoteVersion({
  simulationId,
  defaultAmount,
}: {
  simulationId: string;
  defaultAmount?: number | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        simulationId,
        label: "Saved quote",
        amount: defaultAmount ?? undefined,
        status: "DRAFT",
      }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <button className="btn ghost" onClick={save} disabled={busy}>
      {busy ? "Saving…" : "Save quote version"}
    </button>
  );
}
