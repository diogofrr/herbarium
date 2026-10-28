import type { NextRequest } from "next/server";

/** IP do usuário (o Railway coloca o IP real no começo de x-forwarded-for). */
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Cabeçalhos que a API usa para contar o limite de requisições por usuário, e não pelo
 * IP deste servidor. Sem BFF_SECRET (igual ao da API) a API ignora o IP e usa o do servidor.
 */
export function clientHeaders(request: NextRequest): Record<string, string> {
  const secret = process.env.BFF_SECRET;
  if (!secret) return {};
  return { "x-client-ip": clientIp(request), "x-bff-secret": secret };
}
