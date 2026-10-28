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

// Limite diário por usuário (dia de Brasília, UTC-3), para ninguém esgotar a cota de todos.
const DAILY_LIMIT = 20;
const daily = new Map<string, { day: string; count: number }>();
function brazilDay(): string {
  return new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);
}
// Teto de todos os usuários juntos, abaixo da cota gratuita do Pl@ntNet (500/dia).
const GLOBAL_DAILY_LIMIT = Number(process.env.PLANTNET_DAILY_BUDGET) || 450;
const budget = { day: "", count: 0 };

type TakeResult = "ok" | "user" | "global";

function takeDaily(user: string): TakeResult {
  const day = brazilDay();
  if (budget.day !== day) {
    budget.day = day;
    budget.count = 0;
    for (const [key, value] of daily) if (value.day !== day) daily.delete(key);
  }
  const entry = daily.get(user);
  const current = entry && entry.day === day ? entry : { day, count: 0 };
  if (current.count >= DAILY_LIMIT) return "user";
  if (budget.count >= GLOBAL_DAILY_LIMIT) return "global";
  current.count += 1;
  budget.count += 1;
  daily.set(user, current);
  return "ok";
}
function refundDaily(user: string) {
  const entry = daily.get(user);
  if (entry && entry.count > 0) entry.count -= 1;
  if (budget.count > 0) budget.count -= 1;
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

  const quota = takeDaily(session.sub);
  if (quota === "user") {
    return NextResponse.json(
      { error: `Você já fez ${DAILY_LIMIT} identificações hoje. Volte amanhã.` },
      { status: 429 },
    );
  }
  if (quota === "global") {
    return NextResponse.json(
      { error: "O limite de identificações de hoje acabou para todos. Tente amanhã." },
      { status: 429 },
    );
  }

  try {
    const result = await identifyPlant(image, organ);
    return NextResponse.json({ data: result });
  } catch (err) {
    // Falha do serviço não gasta a cota do usuário.
    refundDaily(session.sub);
    if (err instanceof PlantNetError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Erro ao identificar a planta." }, { status: 502 });
  }
}
