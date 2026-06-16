import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "herbarium_session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) {
      cookieStore.delete(COOKIE_NAME);
      return NextResponse.json({ user: null });
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf-8"),
    ) as { email?: string; name?: string; sub?: string; exp?: number };

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      cookieStore.delete(COOKIE_NAME);
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        email: payload.email ?? "",
        name: payload.name ?? payload.email ?? "",
      },
    });
  } catch {
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ user: null });
  }
}
