import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/server/api";
import { clientHeaders } from "@/lib/server/client-ip";
import { ORGANS, PlantNetError, identifyPlant, type Organ } from "@/lib/server/plantnet";
import { getSessionToken, verifyToken } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// O Pl@ntNet pode demorar alguns segundos; sem isso a Vercel corta a função cedo.
export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png"]);

type Quota =
  | { allowed: true }
  | { allowed: false; reason: "user" | "global"; limit: number }
  | null;

/**
 * A cota diária (por usuário e de todos juntos, por causa do limite gratuito do Pl@ntNet)
 * fica na API: aqui não há memória que se possa contar, pois o front roda em várias instâncias.
 */
async function callQuota(action: "take" | "refund", token: string, request: NextRequest) {
  const res = await fetch(`${API_URL}/me/identify/${action}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, ...clientHeaders(request) },
    cache: "no-store",
  });
  if (res.status === 429) return "throttled" as const;
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as Quota;
}

export async function POST(request: NextRequest) {
  // Exige login: protege a cota da chave e evita abuso anônimo.
  const token = await getSessionToken();
  const session = token ? verifyToken(token) : null;
  if (!token || !session?.sub) {
    return NextResponse.json(
      { error: "Entre na sua conta para identificar plantas." },
      { status: 401 },
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

  const quota = await callQuota("take", token, request).catch(() => null);
  if (quota === "throttled") {
    return NextResponse.json(
      { error: "Muitas identificações seguidas. Aguarde um minuto." },
      { status: 429 },
    );
  }
  if (!quota) {
    return NextResponse.json(
      { error: "Não foi possível verificar o limite agora. Tente de novo em instantes." },
      { status: 503 },
    );
  }
  if (!quota.allowed) {
    const error =
      quota.reason === "user"
        ? `Você já fez ${quota.limit} identificações hoje. Volte amanhã.`
        : "O limite de identificações de hoje acabou para todos. Tente amanhã.";
    return NextResponse.json({ error }, { status: 429 });
  }

  try {
    const result = await identifyPlant(image, organ);
    return NextResponse.json({ data: result });
  } catch (err) {
    // Falha do serviço não gasta a cota do usuário.
    await callQuota("refund", token, request).catch(() => undefined);
    if (err instanceof PlantNetError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Erro ao identificar a planta." }, { status: 502 });
  }
}
