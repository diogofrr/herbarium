import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sem conexão" };

export default function OfflinePage() {
  return (
    <div className="container" style={{ maxWidth: 560, textAlign: "center", paddingTop: 64 }}>
      <h1 className="page-title">Sem conexão</h1>
      <p className="page-lead" style={{ marginInline: "auto" }}>
        Você está offline. As páginas e fotos que você já abriu continuam disponíveis; o mapa e a
        identificação precisam de internet.
      </p>
      <p style={{ marginTop: 20 }}>
        <Link href="/ervas" className="btn btn-primary">
          Abrir o guia de ervas
        </Link>
      </p>
    </div>
  );
}
