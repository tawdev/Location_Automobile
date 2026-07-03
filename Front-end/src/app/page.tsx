import { listVehicles, fetchTypeVehicules } from "@/lib/vehiclesApi";
import { getPublicMarques } from "@/lib/marquesApi";
import HomePageClient from "@/components/home/HomePageClient";
import Header from "@/components/Header";
import ResumeReservationBanner from "@/components/ResumeReservationBanner";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://carforfar.ma";

export const metadata: Metadata = {
  title: "CARFORFAR – Location de voitures au Maroc | Réservation en ligne",
  description:
    "Réservez votre voiture de location au Maroc avec CARFORFAR. Large choix de véhicules, tarifs compétitifs, réservation en ligne facile et rapide.",
  openGraph: {
    title: "CARFORFAR – Location de voitures au Maroc",
    description:
      "Réservez votre voiture de location au Maroc. Large choix, tarifs compétitifs.",
    url: siteUrl,
    siteName: "CARFORFAR",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CARFORFAR – Location de voitures au Maroc",
    description:
      "Réservez votre voiture de location au Maroc. Large choix, tarifs compétitifs.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export default async function HomePage() {
  let vehicles: Awaited<ReturnType<typeof listVehicles>> = [];
  let marques: Awaited<ReturnType<typeof getPublicMarques>> = [];
  let typeVehicules: Awaited<ReturnType<typeof fetchTypeVehicules>> = [];

  try {
    [vehicles, marques, typeVehicules] = await Promise.all([
      listVehicles().catch(() => [] as typeof vehicles),
      getPublicMarques().catch(() => [] as typeof marques),
      fetchTypeVehicules().catch(() => [] as typeof typeVehicules),
    ]);
  } catch {
    // all errors handled individually above
  }

  return (
    <>
      <Header />
      <ResumeReservationBanner />
      <HomePageClient vehicles={vehicles} marques={marques} typeVehicules={typeVehicules} />
    </>
  );
}
