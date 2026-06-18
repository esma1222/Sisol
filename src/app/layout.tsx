import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SISOL Construction — Quotes & Project Simulator",
  description:
    "Request and manage construction project quotes with SISOL Construction Ltd, London's trusted building partner.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <Link href="/" className="brand">
            SISOL<span> Construction</span>
          </Link>
          <div>
            <Link href="/simulator">Get a quote</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/login">Sign in</Link>
          </div>
        </nav>
        {children}
        <footer className="footer">
          <div className="container">
            © {new Date().getFullYear()} SISOL Construction Ltd. All rights reserved. ·
            info@sisolconstruction.co.uk
          </div>
        </footer>
      </body>
    </html>
  );
}
