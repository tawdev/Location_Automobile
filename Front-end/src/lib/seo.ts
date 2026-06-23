export const SITE_NAME = "CARFORFAR";
export const SITE_TAGLINE = "Location de Voitures de Luxe à Marrakech";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.carforfar.ma";
export const DEFAULT_LOCALE = "fr_FR";
export const SUPPORTED_LOCALES = ["fr_FR", "en_US", "ar_AE"];

export const SITE_DESCRIPTION = {
  fr: "CARFORFAR – Location de voitures de luxe à Marrakech. Réservez votre véhicule premium avec chauffeur ou en libre-service. Devis gratuit, livraison aéroport.",
  en: "CARFORFAR – Luxury car rental in Marrakech, Morocco. Book your premium vehicle with or without chauffeur. Free quote, airport delivery.",
  ar: "كارفورفار – تأجير سيارات فاخرة في مراكش، المغرب. احجز سيارتك المميزة مع أو بدون سائق. عرض سعر مجاني، توصيل المطار.",
};

export const PAGE_TITLES: Record<string, { fr: string; en: string; ar: string }> = {
  home: {
    fr: "CARFORFAR – Location de Voitures de Luxe à Marrakech",
    en: "CARFORFAR – Luxury Car Rental in Marrakech, Morocco",
    ar: "كارفورفار – تأجير سيارات فاخرة في مراكش، المغرب",
  },
  vehicules: {
    fr: "Nos Véhicules de Luxe – Location Marrakech | CARFORFAR",
    en: "Our Luxury Vehicles – Marrakech Rental | CARFORFAR",
    ar: "سياراتنا الفاخرة – تأجير في مراكش | كارفورفار",
  },
  a_propos: {
    fr: "À Propos de CARFORFAR – Location Voitures Luxe Marrakech",
    en: "About CARFORFAR – Luxury Car Rental Marrakech",
    ar: "عن كارفورفار – تأجير سيارات فاخرة مراكش",
  },
  contact: {
    fr: "Contactez CARFORFAR – Location Voitures Luxe Marrakech",
    en: "Contact CARFORFAR – Luxury Car Rental Marrakech",
    ar: "اتصل بكارفورفار – تأجير سيارات فاخرة مراكش",
  },
  faq: {
    fr: "FAQ – Questions Fréquentes | CARFORFAR Marrakech",
    en: "FAQ – Frequently Asked Questions | CARFORFAR Marrakech",
    ar: "الأسئلة الشائعة – تأجير سيارات مراكش | كارفورفار",
  },
  blog: {
    fr: "Blog – Actualités & Conseils Auto | CARFORFAR Marrakech",
    en: "Blog – News & Car Tips | CARFORFAR Marrakech",
    ar: "المدونة – أخبار ونصائح السيارات | كارفورفار مراكش",
  },
  press: {
    fr: "Espace Presse – CARFORFAR Marrakech",
    en: "Press Room – CARFORFAR Marrakech",
    ar: "الغرفة الصحفية – كارفورفار مراكش",
  },
  careers: {
    fr: "Carrières – Rejoignez CARFORFAR Marrakech",
    en: "Careers – Join CARFORFAR Marrakech",
    ar: "الوظائف – انضم إلى كارفورفار مراكش",
  },
  terms: {
    fr: "Conditions Générales d'Utilisation | CARFORFAR",
    en: "Terms of Use | CARFORFAR",
    ar: "شروط الاستخدام | كارفورفار",
  },
  privacy: {
    fr: "Politique de Confidentialité | CARFORFAR",
    en: "Privacy Policy | CARFORFAR",
    ar: "سياسة الخصوصية | كارفورفار",
  },
  insurance: {
    fr: "Assurance & Protection – Location Voiture Marrakech | CARFORFAR",
    en: "Insurance & Protection – Car Rental Marrakech | CARFORFAR",
    ar: "التأمين والحماية – تأجير سيارات مراكش | كارفورفار",
  },
  regles: {
    fr: "Règles de Location – CARFORFAR Marrakech",
    en: "Rental Rules – CARFORFAR Marrakech",
    ar: "قواعد التأجير – كارفورفار مراكش",
  },
};

export const PAGE_DESCRIPTIONS: Record<string, { fr: string; en: string; ar: string }> = {
  home: {
    fr: "Découvrez CARFORFAR, le spécialiste de la location de voitures de luxe à Marrakech. Berlines, SUV, sportives – livraison gratuite à l'aéroport. Réservez en ligne.",
    en: "Discover CARFORFAR, the luxury car rental specialist in Marrakech. Sedans, SUVs, sports cars – free airport delivery. Book online.",
    ar: "اكتشف كارفورفار، المتخصص في تأجير السيارات الفاخرة في مراكش. سيدان، دفع رباعي، سيارات رياضية – توصيل مجاني للمطار. احجز أونلاين.",
  },
  vehicules: {
    fr: "Parc de véhicules de luxe à Marrakech : berlines élégantes, SUV premium et sportives. Location avec ou sans chauffeur. Réservation facile.",
    en: "Luxury fleet in Marrakech: elegant sedans, premium SUVs and sports cars. Rental with or without chauffeur. Easy booking.",
    ar: "أسطول سيارات فاخرة في مراكش: سيدان أنيقة، دفع رباعي فاخر، وسيارات رياضية. تأجير مع أو بدون سائق. حجز سهل.",
  },
  a_propos: {
    fr: "CARFORFAR est votre partenaire de confiance pour la location de voitures de luxe à Marrakech. Découvrez notre histoire, notre mission et nos valeurs.",
    en: "CARFORFAR is your trusted partner for luxury car rental in Marrakech. Discover our story, mission, and values.",
    ar: "كارفورفار هو شريكك الموثوق لتأجير السيارات الفاخرة في مراكش. اكتشف قصتنا ورسالتنا وقيمنا.",
  },
  contact: {
    fr: "Contactez CARFORFAR pour réserver votre voiture de luxe à Marrakech. Réponse sous 24h. WhatsApp, téléphone ou email.",
    en: "Contact CARFORFAR to book your luxury car in Marrakech. Reply within 24h. WhatsApp, phone or email.",
    ar: "اتصل بكارفورفار لحجز سيارتك الفاخرة في مراكش. رد خلال 24 ساعة. واتساب، هاتف أو بريد إلكتروني.",
  },
};

export const SOCIAL = {
  twitter: "@carforfar",
  facebook: "https://facebook.com/carforfar",
  instagram: "https://instagram.com/carforfar",
};

export function buildMetaImage(locale: string = "fr"): string {
  return `${SITE_URL}/og-image-${locale}.jpg`;
}
