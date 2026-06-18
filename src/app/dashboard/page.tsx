import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton, SaveQuoteVersion } from "@/components/DashboardActions";

export const dynamic = "force-dynamic";

function gbp(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  const [user, simulations, savedResults] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.sub }, select: { name: true, email: true } }),
    prisma.simulation.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { savedResults: true } } },
    }),
    prisma.savedResult.findMany({
      where: { userId: session.sub },
      orderBy: { createdAt: "desc" },
      include: { simulation: { select: { title: true } } },
    }),
  ]);

  return (
    <main className="container section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "var(--navy)", marginBottom: 4 }}>Your dashboard</h1>
          <p className="muted" style={{ margin: 0 }}>
            Signed in as {user?.name ?? user?.email}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="btn" href="/simulator">
            New quote
          </Link>
          <LogoutButton />
        </div>
      </div>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ color: "var(--navy)" }}>Quotes / simulations</h2>
        {simulations.length === 0 ? (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              No quotes yet. <Link href="/simulator">Create your first quote</Link>.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Estimate</th>
                  <th>Status</th>
                  <th>Versions</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {simulations.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.title}</td>
                    <td>
                      <span className="tag">{s.projectType.replace(/_/g, " ")}</span>
                    </td>
                    <td>
                      {gbp(s.estimateMin)} – {gbp(s.estimateMax)}
                    </td>
                    <td>{s.status}</td>
                    <td>{s._count.savedResults}</td>
                    <td>
                      <SaveQuoteVersion simulationId={s.id} defaultAmount={s.estimateMax} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginTop: 36 }}>
        <h2 style={{ color: "var(--navy)" }}>Saved quote versions</h2>
        {savedResults.length === 0 ? (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              Saved quote versions will appear here.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Quote</th>
                  <th>Version</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Saved</th>
                </tr>
              </thead>
              <tbody>
                {savedResults.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.simulation.title}</td>
                    <td>v{r.version}</td>
                    <td>{gbp(r.amount)}</td>
                    <td>{r.status}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
