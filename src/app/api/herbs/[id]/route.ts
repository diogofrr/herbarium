import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Autenticação necessária para editar marcadores." },
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

  const patch: Record<string, unknown> = {};

  const status = parseStatus(
    typeof body.status === "string" ? body.status : null,
  );
  if (status) patch.status = status;

  if (typeof body.notes === "string") patch.notes = body.notes;
  if (typeof body.addressLabel === "string") patch.addressLabel = body.addressLabel;
  if (typeof body.herbKey === "string" && body.herbKey.trim()) {
    patch.herbKey = body.herbKey.trim();
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "Nenhum campo válido para atualização." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${API_URL}/herbarium/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });

    const data = (await res.json()) as { result?: unknown; message?: string };

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: "Marcação não encontrada." },
          { status: 404 },
        );
      }
      const msg =
        typeof data.message === "string"
          ? data.message
          : "Não foi possível atualizar.";
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    return NextResponse.json({ data: data.result });
  } catch {
    return NextResponse.json(
      { error: "Erro ao conectar com o servidor" },
      { status: 503 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Autenticação necessária para remover marcadores." },
      { status: 401 },
    );
  }

  try {
    const res = await fetch(`${API_URL}/herbarium/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: "Marcação não encontrada." },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { error: "Não foi possível remover." },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao conectar com o servidor" },
      { status: 503 },
    );
  }
}
