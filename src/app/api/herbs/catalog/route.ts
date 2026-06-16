import { NextResponse } from "next/server";

const API_URL = process.env.HERBARIUM_API_URL ?? "http://localhost:8080";

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/herbarium/catalog`, {
      next: { revalidate: 3600 },
    });
    const data = (await res.json()) as { result?: unknown; message?: string };
    if (!res.ok) {
      return NextResponse.json(
        { error: "Não foi possível carregar o catálogo." },
        { status: res.status },
      );
    }
    return NextResponse.json({ data: data.result ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Erro ao conectar com o servidor" },
      { status: 503 },
    );
  }
}
