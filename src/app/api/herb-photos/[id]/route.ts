import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/server/api";
import { clientHeaders } from "@/lib/server/client-ip";

type Ctx = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f-]{36}$/;

/** Foto de erva enviada pela curadoria: leitura pública, servida pela API. */
export async function GET(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  try {
    const res = await fetch(`${API_URL}/herbs/photos/${id}`, { headers: clientHeaders(request), cache: "no-store" });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) {
      return NextResponse.json({ error: "Não encontrado." }, { status: res.status === 404 ? 404 : 502 });
    }
    return new NextResponse(await res.arrayBuffer(), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao conectar com o servidor" }, { status: 503 });
  }
}
