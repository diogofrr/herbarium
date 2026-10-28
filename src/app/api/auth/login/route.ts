import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/server/api";
import { clientHeaders } from "@/lib/server/client-ip";
import { setSessionToken } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...clientHeaders(request) },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    if (res.status === 429) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde um minuto e tente de novo." },
        { status: 429 },
      );
    }
    if (!res.ok) {
      // Resposta uniforme: não revela se o e-mail existe.
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const data = (await res.json()) as {
      access_token: string;
      user: { id: string; email: string; name: string; role: string };
    };
    await setSessionToken(data.access_token);
    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json({ error: "Erro ao conectar com o servidor" }, { status: 503 });
  }
}
