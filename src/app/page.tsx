import { Suspense } from "react";
import { HerbMapScreen } from "@/components/herb-map-screen";

export default function Home() {
  return (
    <Suspense fallback={<div className="map-placeholder">Carregando mapa…</div>}>
      <HerbMapScreen />
    </Suspense>
  );
}
