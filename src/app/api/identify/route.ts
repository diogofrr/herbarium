import { NextRequest, NextResponse } from "next/server";
import { ORGANS, PlantNetError, identifyPlant, type Organ } from "@/lib/server/plantnet";
import { getSessionToken, verifyToken } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png"]);

// Limite simples por usuário (a cota do Pl@ntNet é diária e compartilhada).
const hits = new Map<string, number[]>();
function rateLimited(user: string): boolean {
  const now = Date.now();
  const recent = (hits.get(user) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 6) {
    hits.set(user, recent);
    return true;
  }
  recent.push(now);
  hits.set(user, recent);
  return false;
}

export async function POST(request: NextRequest) {
  // Exige login: protege a cota da chave e evita abuso anônimo.
  const token = await getSessionToken();
  const session = token ? verifyToken(token) : null;
  if (!session?.sub) {
    return NextResponse.json(
      { error: "Entre na sua conta para identificar plantas." },
      { status: 401 },
    );
  }
  if (rateLimited(session.sub)) {
    return NextResponse.json(
      { error: "Muitas identificações seguidas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  const form = await request.formData().catch(() => null);
  const image = form?.get("image");
  if (!(image instanceof Blob)) {
    return NextResponse.json({ error: "Envie uma foto." }, { status: 400 });
  }
  if (!ALLOWED.has(image.type)) {
    return NextResponse.json({ error: "Use uma foto JPEG ou PNG." }, { status: 400 });
  }
  if (image.size > MAX_BYTES) {
    return NextResponse.json({ error: "Foto grande demais (máximo 4 MB)." }, { status: 413 });
  }
  const organRaw = String(form?.get("organ") ?? "auto");
  const organ: Organ = (ORGANS as string[]).includes(organRaw) ? (organRaw as Organ) : "auto";

  try {
    const result = await identifyPlant(image, organ);
    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof PlantNetError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Erro ao identificar a planta." }, { status: 502 });
  }
}
