import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookmarkCheck } from "lucide-react";
import { OfflineButton } from "@/components/offline-button";
import { HerbIndex } from "@/components/herb-index";
import { getHerbs, getTaxonomy } from "@/lib/server/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Guia de ervas",
  description:
    "Guia de ervas da Umbanda: orixás, povos de atuação, temperatura e uso de cada erva.",
};

export default async function ErvasPage() {
  const [herbs, taxonomy] = await Promise.all([getHerbs(), getTaxonomy()]);

  return (
    <div className="container">
      <h1 className="page-title">Guia de ervas</h1>
      <p className="page-lead">
        Para cada erva: orixás, povos de atuação, temperatura e para que ela serve, com fotos e fontes.
      </p>
      <p className="disclaimer">
        Cada casa tem a sua doutrina. Este guia segue a apostila de ervas e, depois, o livro Rituais com Ervas. Converse com o dirigente da sua casa antes de usar qualquer erva. O guia não substitui orientação médica.
      </p>

      <div className="guide-actions">
        <Link href="/minhas-ervas" className="btn">
          <BookmarkCheck size={16} aria-hidden />
          Minhas ervas
        </Link>
        <OfflineButton />
      </div>

      {herbs ? (
        <Suspense fallback={<p className="result-line">Carregando o guia…</p>}>
          <HerbIndex herbs={herbs} taxonomy={taxonomy} />
        </Suspense>
      ) : (
        <div className="empty">
          <p>Não foi possível carregar o guia agora. Tente novamente em instantes.</p>
        </div>
      )}
    </div>
  );
}
