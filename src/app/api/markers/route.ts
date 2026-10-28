import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/server/api";
import { clientHeaders } from "@/lib/server/client-ip";
import { apiErrorMessage, getSessionToken } from "@/lib/server/session";
import { isWithinUberlandia } from "@/lib/uberlandia";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const withGone = request.nextUrl.searchParams.get("incluirEsgotados") === "true";
  try {
    const res = await fetch(`${API_URL}/markers${withGone ? "?incluirEsgotados=true" : ""}`, {
      headers: clientHeaders(request),
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Não foi possível carregar os pontos." },
        { status: res.status },
      );
    }
    return NextResponse.json({ data: await res.json() });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar marcadores" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Entre na sua conta para adicionar marcações." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const herbSlug = typeof body.herbSlug === "string" ? body.herbSlug.trim() : "";
  const lat = typeof body.lat === "number" ? body.lat : Number.NaN;
  const lng = typeof body.lng === "number" ? body.lng : Number.NaN;
  const status = body.status === "muita" || body.status === "pouca" ? body.status : null;

  if (!herbSlug) return NextResponse.json({ error: "Escolha uma erva." }, { status: 400 });
  if (!status) return NextResponse.json({ error: "Informe a quantidade." }, { status: 400 });
  if (!isWithinUberlandia(lat, lng)) {
    return NextResponse.json(
      { error: "A marcação precisa estar dentro de Uberlândia - MG." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${API_URL}/markers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...clientHeaders(request),
      },
      body: JSON.stringify({
        herbSlug,
        status,
        lat,
        lng,
        notes: typeof body.notes === "string" ? body.notes.trim() : "",
        addressLabel: typeof body.addressLabel === "string" ? body.addressLabel.trim() : "",
      }),
    });
    const data = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      return NextResponse.json(
        { error: apiErrorMessage(data, "Não foi possível salvar.") },
        { status: res.status },
      );
    }
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao conectar com o servidor" }, { status: 503 });
  }
}
