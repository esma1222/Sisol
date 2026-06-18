/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Prisma client + Neon serverless driver must run in the Node.js runtime.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon", "@neondatabase/serverless"],

  // Serve the full marketing site (a self-contained DesignCombo export that
  // renders client-side) at "/" as a static document, ahead of the app router.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/site.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
