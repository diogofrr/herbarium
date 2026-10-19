import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/server/api";
import { apiErrorMessage, getSessionToken } from "@/lib/server/session";

type Ctx = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function forward(
  method: "PATCH" | "DELETE",
  id: string,
  body?: Record<string, unknown>,
) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  }
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Marcador inválido." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/markers/${id}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      return NextResponse.json(
        { error: apiErrorMessage(data, "Não foi possível concluir a ação.") },
        { status: res.status },
      );
    }
    return NextResponse.json(method === "DELETE" ? { success: true } : { data });
  } catch {
    return NextResponse.json({ error: "Erro ao conectar com o servidor" }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.herbSlug === "string") patch.herbSlug = body.herbSlug.trim();
  if (typeof body.notes === "string") patch.notes = body.notes.trim();
  if (typeof body.addressLabel === "string") patch.addressLabel = body.addressLabel.trim();
  if (body.status === "muita" || body.status === "pouca") patch.status = body.status;

  return forward("PATCH", id, patch);
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return forward("DELETE", id);
}
