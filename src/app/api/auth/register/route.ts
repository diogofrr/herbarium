import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/server/api";
import { apiErrorMessage, setSessionToken } from "@/lib/server/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: body.name, email: body.email, password: body.password }),
    });
    const data = (await res.json().catch(() => null)) as unknown;

    if (res.status === 429) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde um minuto e tente de novo." },
        { status: 429 },
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: apiErrorMessage(data, "Erro ao criar conta") },
        { status: res.status },
      );
    }

    const ok = data as {
      access_token: string;
      user: { id: string; email: string; name: string; role: string };
    };
    await setSessionToken(ok.access_token);
    return NextResponse.json({ user: ok.user });
  } catch {
    return NextResponse.json({ error: "Erro ao conectar com o servidor" }, { status: 503 });
  }
}
