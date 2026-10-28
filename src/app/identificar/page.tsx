import type { Metadata } from "next";
import { PlantIdentifier } from "@/components/plant-identifier";

export const metadata: Metadata = {
  title: "Identificar planta",
  description: "Fotografe uma planta e descubra se ela está no guia de ervas.",
};

export default function IdentifyPage() {
  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h1 className="page-title">Identificar planta</h1>
      <p className="page-lead">
        Tire uma foto de uma folha, flor ou fruto e o Pl@ntNet sugere qual planta é. Se ela estiver no guia, você abre
        a página da erva com um toque.
      </p>
      <PlantIdentifier />
    </div>
  );
}
