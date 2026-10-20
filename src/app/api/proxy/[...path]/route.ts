import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/server/api";
import { apiErrorMessage, getSessionToken } from "@/lib/server/session";

export const dynamic = "force-dynamic";

/** Só estes trechos da API passam por aqui; o resto tem rota própria. */
const ALLOWED = new Set(["me", "admin", "markers"]);

type Ctx = { params: Promise<{ path: string[] }> };

/**
 * Ponte para a API: o navegador nunca vê o token (cookie httpOnly). Leitura pública
 * só para /markers (detalhe e foto); o restante exige sessão.
 */
async function forward(request: NextRequest, { params }: Ctx) {
  const { path } = await params;
  if (!path.length || !ALLOWED.has(path[0]) || path.some((p) => !p || p === "." || p === "..")) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }

  const token = await getSessionToken();
  const isPublicRead = request.method === "GET" && path[0] === "markers";
  if (!token && !isPublicRead) {
    return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  }

  const hasBody = request.method !== "GET" && request.method !== "DELETE";
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (hasBody) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(
      `${API_URL}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
      {
        method: request.method,
        headers,
        body: hasBody ? await request.text() : undefined,
        cache: "no-store",
      },
    );

    const type = res.headers.get("content-type") ?? "";
    if (res.ok && type.startsWith("image/")) {
      return new NextResponse(await res.arrayBuffer(), {
        headers: { "Content-Type": type, "Cache-Control": "public, max-age=300" },
      });
    }

    const data = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      return NextResponse.json(
        { error: apiErrorMessage(data, "Não foi possível concluir a ação.") },
        { status: res.status },
      );
    }
    // Edição de erva pelo administrador: a página pública atualiza na hora.
    if (path[0] === "admin" && path[1] === "herbs" && path[2] && hasBody) {
      revalidatePath("/ervas");
      revalidatePath(`/ervas/${path[2]}`);
    }
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Erro ao conectar com o servidor" }, { status: 503 });
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
