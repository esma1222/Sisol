/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Prisma client + Neon serverless driver must run in the Node.js runtime.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon", "@neondatabase/serverless"],
};

export default nextConfig;
