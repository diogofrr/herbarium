export type AuthUser = { email: string; name: string };

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? "Erro desconhecido";
  } catch {
    return "Erro desconhecido";
  }
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { user: AuthUser };
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function sessionRequest(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/session");
  if (!res.ok) return null;
  const data = (await res.json()) as { user: AuthUser | null };
  return data.user;
}
