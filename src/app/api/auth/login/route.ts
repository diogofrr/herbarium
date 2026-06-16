import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.HERBARIUM_API_URL ?? "http://localhost:8080";
const COOKIE_NAME = "herbarium_session";
const MAX_AGE = 60 * 60 * 24; // 24h

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const message =
        typeof data.message === "string"
          ? data.message
          : "Credenciais inválidas";
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const result = data.result as {
      access_token: string;
      user: { email: string; name: string };
    };

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

    return NextResponse.json({
      user: { email: result.user.email, name: result.user.name },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao conectar com o servidor" },
      { status: 503 },
    );
  }
}
