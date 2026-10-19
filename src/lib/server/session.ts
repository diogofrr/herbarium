import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "herbarium_session";
const MAX_AGE = 60 * 60 * 24; // 24h, igual ao JWT da API

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "HERBMASTER" | "ADMIN";
};

type JwtPayload = {
  sub?: string;
  email?: string;
  name?: string;
  role?: SessionUser["role"];
  exp?: number;
};

/**
 * Valida a assinatura HMAC-SHA256 do JWT (mesmo segredo da API) e a expiração.
 * Sem isso, um cookie forjado seria aceito como sessão. Falha fechada: sem
 * JWT_SECRET configurado, toda sessão é considerada inválida.
 */
export function verifyToken(token: string): JwtPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;

  const expected = createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");
  const provided = Buffer.from(signatureB64);
  const expectedBuf = Buffer.from(expected);
  if (provided.length !== expectedBuf.length || !timingSafeEqual(provided, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8"),
    ) as JwtPayload;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

export async function setSessionToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Traduz o erro do Nest (message string ou lista) para uma mensagem curta. */
export function apiErrorMessage(data: unknown, fallback: string): string {
  const message = (data as { message?: unknown } | null)?.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  return fallback;
}
