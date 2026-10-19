import { NextResponse } from "next/server";
import { clearSession, getSessionToken, verifyToken } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ user: null });

  const payload = verifyToken(token);
  if (!payload?.sub) {
    await clearSession();
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: payload.sub,
      email: payload.email ?? "",
      name: payload.name ?? payload.email ?? "",
      role: payload.role ?? "USER",
    },
  });
}
