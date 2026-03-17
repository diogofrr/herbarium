import { NextRequest, NextResponse } from "next/server";

import {
  HERB_CLASSIFICATIONS,
  HERB_KEYS,
  isHerbKey,
} from "@/lib/herb-catalog";
import { createHerb, listHerbs } from "@/lib/herb-store";
import { isWithinUberlandia } from "@/lib/uberlandia";
import type { HerbClassification, HerbStatus } from "@/types/herb";

export const runtime = "nodejs";

function parseStatus(value: string | null): HerbStatus | undefined {
  if (value === "pouca" || value === "muita") {
    return value;
  }

  return undefined;
}

function parseClassification(value: string | null): HerbClassification | undefined {
  if (!value) {
    return undefined;
  }

  if (HERB_CLASSIFICATIONS.includes(value as HerbClassification)) {
    return value as HerbClassification;
  }

  return undefined;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const status = parseStatus(request.nextUrl.searchParams.get("status"));
  const classification = parseClassification(request.nextUrl.searchParams.get("classification"));

  const data = await listHerbs({
    query,
    status,
    classification,
  });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const herbKeyRaw = typeof body.herbKey === "string" ? body.herbKey : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const addressLabel = typeof body.addressLabel === "string" ? body.addressLabel.trim() : "";
  const lat = typeof body.lat === "number" ? body.lat : Number.NaN;
  const lng = typeof body.lng === "number" ? body.lng : Number.NaN;
  const status = parseStatus(typeof body.status === "string" ? body.status : null);

  if (!isHerbKey(herbKeyRaw) || !HERB_KEYS.includes(herbKeyRaw)) {
    return NextResponse.json(
      { error: "Erva inválida para o catálogo." },
      { status: 400 },
    );
  }

  if (notes.length > 280) {
    return NextResponse.json(
      { error: "Observação deve ter no máximo 280 caracteres." },
      { status: 400 },
    );
  }

  if (addressLabel.length > 140) {
    return NextResponse.json(
      { error: "Endereço deve ter no máximo 140 caracteres." },
      { status: 400 },
    );
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

  const item = await createHerb({
    herbKey: herbKeyRaw,
    notes,
    status,
    lat,
    lng,
    addressLabel,
  });

  return NextResponse.json({ data: item }, { status: 201 });
}
