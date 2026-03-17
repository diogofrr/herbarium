import { NextRequest, NextResponse } from "next/server";

import { isHerbKey } from "@/lib/herb-catalog";
import { deleteHerb, updateHerb } from "@/lib/herb-store";
import type { HerbStatus } from "@/types/herb";

export const runtime = "nodejs";

function parseStatus(value: string | null): HerbStatus | undefined {
  if (value === "pouca" || value === "muita") {
    return value;
  }

  return undefined;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corpo da requisicao invalido." },
      { status: 400 },
    );
  }

  const patch = {
    status: parseStatus(typeof body.status === "string" ? body.status : null),
    notes: typeof body.notes === "string" ? body.notes : undefined,
    addressLabel: typeof body.addressLabel === "string" ? body.addressLabel : undefined,
    herbKey:
      typeof body.herbKey === "string" && isHerbKey(body.herbKey)
        ? body.herbKey
        : undefined,
  };

  if (
    !patch.status &&
    typeof patch.notes !== "string" &&
    typeof patch.addressLabel !== "string" &&
    !patch.herbKey
  ) {
    return NextResponse.json(
      { error: "Nenhum campo valido para atualizacao." },
      { status: 400 },
    );
  }

  if (typeof patch.notes === "string" && patch.notes.length > 280) {
    return NextResponse.json(
      { error: "Observacao deve ter no maximo 280 caracteres." },
      { status: 400 },
    );
  }

  if (typeof patch.addressLabel === "string" && patch.addressLabel.length > 140) {
    return NextResponse.json(
      { error: "Endereco deve ter no maximo 140 caracteres." },
      { status: 400 },
    );
  }

  const updated = await updateHerb(id, patch);

  if (!updated) {
    return NextResponse.json({ error: "Marcacao nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const removed = await deleteHerb(id);

  if (!removed) {
    return NextResponse.json({ error: "Marcacao nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
