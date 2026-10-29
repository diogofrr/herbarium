import { NextRequest, NextResponse } from "next/server";

import { UBERLANDIA_BOUNDS } from "@/lib/uberlandia";

export const runtime = "nodejs";

type GeocodeResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (q.length < 3) {
    return NextResponse.json({ data: [] });
  }

  const params = new URLSearchParams({
    q: `${q}, Uberlândia, Minas Gerais, Brasil`,
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "br",
    limit: "8",
    bounded: "1",
    viewbox: `${UBERLANDIA_BOUNDS.west},${UBERLANDIA_BOUNDS.north},${UBERLANDIA_BOUNDS.east},${UBERLANDIA_BOUNDS.south}`,
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      "User-Agent": "herbarium-uberlandia/1.0",
      "Accept-Language": "pt-BR",
    },
    // O Nominatim pede no máximo 1 consulta por segundo: repetições saem do cache do Next.
    next: { revalidate: 600 },
  }).catch(() => null);

  if (!response || !response.ok) {
    return NextResponse.json(
      { error: "Falha ao consultar endereço." },
      { status: 502 },
    );
  }

  // O Nominatim pode responder 200 com HTML (manutenção) ou um objeto de erro.
  // Blindamos o parse e a suposição de array para não estourar 500.
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return NextResponse.json(
      { error: "Falha ao consultar endereço." },
      { status: 502 },
    );
  }

  if (!Array.isArray(payload)) {
    return NextResponse.json({ data: [] });
  }

  const data = (payload as GeocodeResult[]).map((item) => ({
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));

  return NextResponse.json({ data });
}
