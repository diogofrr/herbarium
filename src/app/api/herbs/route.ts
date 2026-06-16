import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { isWithinUberlandia } from "@/lib/uberlandia";
import type { HerbStatus } from "@/types/herb";

const API_URL = process.env.HERBARIUM_API_URL ?? "http://localhost:8080";
const COOKIE_NAME = "herbarium_session";

function parseStatus(value: string | null): HerbStatus | undefined {
  if (value === "pouca" || value === "muita") return value;
  return undefined;
}

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function GET(request: NextRequest) {
  const params = new URLSearchParams();
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const status = parseStatus(request.nextUrl.searchParams.get("status"));

  if (q) params.set("q", q);
  if (status) params.set("status", status);

  try {
    const res = await fetch(`${API_URL}/herbarium?${params.toString()}`);
    const data = (await res.json()) as { result?: unknown; message?: string };
    return NextResponse.json({ data: data.result ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar marcadores" },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Autenticação necessária para adicionar marcadores." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const herbKey = typeof body.herbKey === "string" ? body.herbKey.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const addressLabel =
    typeof body.addressLabel === "string" ? body.addressLabel.trim() : "";
  const lat = typeof body.lat === "number" ? body.lat : Number.NaN;
  const lng = typeof body.lng === "number" ? body.lng : Number.NaN;
  const status = parseStatus(
    typeof body.status === "string" ? body.status : null,
  );

  if (!herbKey) {
    return NextResponse.json({ error: "Erva é obrigatória." }, { status: 400 });
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Coordenadas inválidas." },
      { status: 400 },
    );
  }

  if (!status) {
    return NextResponse.json(
      { error: "Status inválido. Use pouca ou muita." },
      { status: 400 },
    );
  }

  if (!isWithinUberlandia(lat, lng)) {
    return NextResponse.json(
      { error: "Só é permitido marcar pontos dentro de Uberlândia - MG." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${API_URL}/herbarium`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ herbKey, notes, status, addressLabel, lat, lng }),
    });

    const data = (await res.json()) as { result?: unknown; message?: string };

    if (!res.ok) {
      const msg =
        typeof data.message === "string"
          ? data.message
          : "Não foi possível salvar.";
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    return NextResponse.json({ data: data.result }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro ao conectar com o servidor" },
      { status: 503 },
    );
  }
}
