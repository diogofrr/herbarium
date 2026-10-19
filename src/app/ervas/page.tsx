import { Suspense } from "react";
import type { Metadata } from "next";
import { HerbIndex } from "@/components/herb-index";
import { getHerbs, getTaxonomy } from "@/lib/server/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Guia de ervas",
  description:
    "Guia de ervas da Umbanda: para cada erva, os orixás, os povos de atuação, a temperatura e a função principal.",
};

export default async function ErvasPage() {
  const [herbs, taxonomy] = await Promise.all([getHerbs(), getTaxonomy()]);

  return (
    <div className="container">
      <h1 className="page-title">Guia de ervas</h1>
      <p className="page-lead">
        Orixás, povos de atuação, temperatura e função de cada erva, com fotos e fontes.
      </p>
      <p className="disclaimer">
        Cada casa tem a sua doutrina. Aqui valem, em primeiro lugar, a apostila da Casa de
        Umbanda Rosa Maria e, depois, o livro Rituais com Ervas. Converse com o dirigente da sua
        casa antes de usar qualquer erva. Não é orientação médica.
      </p>

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
