import { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CARFORFAR – Location de Voitures de Luxe à Marrakech",
    short_name: "CARFORFAR",
    description: "Location de voitures de luxe à Marrakech. Réservez votre berline, SUV ou sportive Premium.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1729",
    theme_color: "#395886",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["travel", "automotive", "business"],
    lang: "fr",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
