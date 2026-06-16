"use server";

import { cookies } from "next/headers";

const API_URL = process.env.HERBARIUM_API_URL ?? "http://localhost:8080";
const COOKIE_NAME = "herbarium_session";
const MAX_AGE = 60 * 60 * 24; // 24h

type AuthUser = { email: string; name: string };
type AuthResult = { user: AuthUser } | { error: string };

async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function loginAction(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const message =
        typeof data.message === "string" ? data.message : "Credenciais inválidas";
      return { error: message };
    }

    const result = data.result as {
      access_token: string;
      user: { email: string; name: string };
    };

    await setSessionCookie(result.access_token);

    return { user: { email: result.user.email, name: result.user.name } };
  } catch {
    return { error: "Erro ao conectar com o servidor" };
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const message =
        typeof data.message === "string" ? data.message : "Erro ao criar conta";
      return { error: message };
    }

    const result = data.result as {
      access_token: string;
      user: { email: string; name: string };
    };

    await setSessionCookie(result.access_token);

    return { user: { email: result.user.email, name: result.user.name } };
  } catch {
    return { error: "Erro ao conectar com o servidor" };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionAction(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return { error: "Sessão não encontrada" };
  }

  try {
    // Decode JWT payload to get user info (without verifying — backend verifies)
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) return { error: "Token inválido" };

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf-8"),
    ) as { email?: string; name?: string; sub?: string; exp?: number };

    // Check if expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      cookieStore.delete(COOKIE_NAME);
      return { error: "Sessão expirada" };
    }

    return {
      user: {
        email: payload.email ?? "",
        name: payload.name ?? payload.email ?? "",
      },
    };
  } catch {
    cookieStore.delete(COOKIE_NAME);
    return { error: "Token inválido" };
  }
}
