import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { json } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return json({ user: null });

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });

  return json({ user });
}
