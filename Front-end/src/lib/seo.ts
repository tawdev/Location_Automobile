export const SITE_NAME = "CARFORFAR";
export const SITE_TAGLINE = "Location de Voitures de Luxe à Marrakech";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.carforfar.com";
export const DEFAULT_LOCALE = "fr_MA";
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
  support: {
    fr: "Centre d'Aide – CARFORFAR Marrakech",
    en: "Help Center – CARFORFAR Marrakech",
    ar: "مركز المساعدة – كارفورفار مراكش",
  },
  cancellation: {
    fr: "Annulation – CARFORFAR Marrakech",
    en: "Cancellation – CARFORFAR Marrakech",
    ar: "الإلغاء – كارفورفار مراكش",
  },
};

export const PAGE_DESCRIPTIONS: Record<string, { fr: string; en: string; ar: string }> = {
  home: {
    fr: "CARFORFAR – Location de voitures de luxe à Marrakech. Réservez votre berline, SUV ou sportive Premium. Livraison aéroport gratuite, chauffeur privé disponible. Devis en 24h.",
    en: "CARFORFAR – Luxury car rental in Marrakech. Book your premium sedan, SUV or sports car. Free airport delivery, private chauffeur available. Quote in 24h.",
    ar: "كارفورفار – تأجير سيارات فاخرة في مراكش. احجز سيارتك السيدان أو الدفع الرباعي أو الرياضية الفاخرة. توصيل مجاني للمطار، سائق خاص متاح. عرض سعر في 24 ساعة.",
  },
  vehicules: {
    fr: "Découvrez notre flotte de voitures de luxe à Marrakech : BMW, Mercedes, Audi, Range Rover et plus. Location avec ou sans chauffeur. Réservation en ligne facile et sécurisée.",
    en: "Discover our luxury car fleet in Marrakech: BMW, Mercedes, Audi, Range Rover and more. Rent with or without chauffeur. Easy online booking.",
    ar: "اكتشف أسطول سياراتنا الفاخرة في مراكش: بي إم دبليو، مرسيدس، أودي، رينج روفر والمزيد. تأجير مع أو بدون سائق. حجز أونلاين سهل وآمن.",
  },
  a_propos: {
    fr: "CARFORFAR est votre expert en location de voitures de luxe à Marrakech. Plus de 15 ans d'expérience, 200+ véhicules premium, 5000+ clients satisfaits. Découvrez notre histoire.",
    en: "CARFORFAR is your luxury car rental expert in Marrakech. Over 15 years experience, 200+ premium vehicles, 5000+ satisfied clients. Discover our story.",
    ar: "كارفورفار هو خبيرك في تأجير السيارات الفاخرة في مراكش. أكثر من 15 عامًا من الخبرة، 200+ سيارة فاخرة، 5000+ عميل راضٍ. اكتشف قصتنا.",
  },
  contact: {
    fr: "Contactez CARFORFAR pour réserver votre voiture de luxe à Marrakech. WhatsApp, téléphone ou email. Réponse sous 24h. Devis gratuit personnalisé.",
    en: "Contact CARFORFAR to book your luxury car in Marrakech. WhatsApp, phone or email. Reply within 24h. Free personalized quote.",
    ar: "اتصل بكارفورفار لحجز سيارتك الفاخرة في مراكش. واتساب، هاتف أو بريد إلكتروني. رد خلال 24 ساعة. عرض سعر مجاني مخصص.",
  },
};

export const SOCIAL = {
  twitter: "@carforfar",
  facebook: "https://facebook.com/carforfar",
  instagram: "https://instagram.com/carforfar",
};
