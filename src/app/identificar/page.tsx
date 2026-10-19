import type { Metadata } from "next";
import { PlantIdentifier } from "@/components/plant-identifier";

export const metadata: Metadata = {
  title: "Identificar planta",
  description: "Tire uma foto de uma planta e veja se ela está no guia de ervas.",
};

export default function IdentifyPage() {
  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Identificar planta</h1>
      <p className="page-lead">
        Fotografe uma folha, flor ou fruto e o Pl@ntNet sugere a espécie. Se ela estiver no guia, você vai direto
        para a página da erva.
      </p>
      <PlantIdentifier />
    </div>
  );
}
