import { NextResponse } from "next/server";
import { API_URL, WIKI_REVALIDATE } from "@/lib/server/api";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/herbs`, { next: { revalidate: WIKI_REVALIDATE } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Não foi possível carregar o guia de ervas." },
        { status: res.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { data: await res.json() },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao conectar com o servidor" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
