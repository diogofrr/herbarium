import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ewé: guia de ervas e mapa",
    short_name: "Ewé",
    description: "Guia de ervas da Umbanda e mapa colaborativo de ervas em Uberlândia.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f1e6",
    theme_color: "#255633",
    categories: ["education", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Guia de ervas", url: "/ervas" },
      { name: "Identificar planta", url: "/identificar" },
    ],
  };
}
