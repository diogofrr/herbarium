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
    cache: "no-store",
  }).catch(() => null);

  if (!response || !response.ok) {
    return NextResponse.json(
      { error: "Falha ao consultar endereço." },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as GeocodeResult[];
  const data = payload.map((item) => ({
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));

  return NextResponse.json({ data });
}
