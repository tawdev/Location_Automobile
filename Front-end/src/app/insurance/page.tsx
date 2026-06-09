"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Car,
  Lock,
  Eye,
  CheckCircle,
  ChevronDown,
  Sparkles,
  ArrowUp,
  Info,
  Download,
  Printer,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Activity,
  FileCheck
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Section = {
  title: string;
  icon: any;
  desc: string;
};

type TiersItem = {
  id: string;
  name: string;
  badge: string;
  price: string;
  desc: string;
  popular: boolean;
  gradient: string;
  features: string[];
  deductible: string;
};

type FAQItem = {
  q: string;
  a: string;
};

type LangContent = {
  meta: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    lastUpdated: string;
    duration: string;
    docType: string;
  };
  quickStats: { label: string; value: string }[];
  tiers: {
    title: string;
    subtitle: string;
    items: TiersItem[];
  };
  details: {
    title: string;
    subtitle: string;
    sections: Section[];
  };
  faq: {
    title: string;
    subtitle: string;
    items: FAQItem[];
  };
  checklist: {
    title: string;
    subtitle: string;
    covered: string;
    notCovered: string;
    coveredList: string[];
    notCoveredList: string[];
  };
  cta: {
    title: string;
    desc: string;
    button: string;
  };
};

const CONTENT: Record<"en" | "fr" | "ar", LangContent> = {
  en: {
    meta: {
      badge: "Insurance & Protection",
      title: "Drive with Complete",
      titleAccent: "Peace of Mind",
      subtitle: "Choose your level of protection. Basic coverage is included in all bookings, with optional upgrades for maximum security.",
      lastUpdated: "Last updated: June 2026",
      duration: "5 min read",
      docType: "Doc Ref: PP-INS-2026"
    },
    quickStats: [
      { label: "Roadside Assistance", value: "24/7 Included" },
      { label: "Claims Processing", value: "100% Digital" },
      { label: "Protection Tiers", value: "3 Levels" }
    ],
    tiers: {
      title: "Compare Protection Levels",
      subtitle: "Select the coverage that fits your driving needs in Morocco",
      items: [
        {
          id: "basic",
          name: "Basic Protection",
          badge: "Included",
          price: "Included in booking",
          desc: "Standard protection required by law, covering third-party liability and basic vehicle damage.",
          popular: false,
          gradient: "from-slate-500 to-slate-700",
          features: [
            "Third-Party Liability (Responsabilité Civile)",
            "Basic Theft Protection (Deductible applies)",
            "Basic Collision Damage (Deductible applies)",
            "Standard 24/7 Towing Service"
          ],
          deductible: "Security Deposit (Caution): 15,000 DH"
        },
        {
          id: "gold",
          name: "Gold Protection",
          badge: "Recommended",
          price: "150 DH / day",
          desc: "Significantly reduces your deductible and adds essential coverage for glass, tires, and minor scuffs.",
          popular: true,
          gradient: "from-[#f39c12] to-amber-600",
          features: [
            "All benefits of Basic Protection",
            "Deductible reduced by 65%",
            "Glass, Windshield & Headlight Coverage",
            "Tire puncture and rim protection",
            "Priority Roadside Support"
          ],
          deductible: "Security Deposit (Caution): 5,000 DH"
        },
        {
          id: "platinum",
          name: "Platinum Zero-Deductible",
          badge: "Premium",
          price: "300 DH / day",
          desc: "Zero liability for any damage, theft, or windshield repair. Complete peace of mind for luxury travel.",
          popular: false,
          gradient: "from-indigo-600 to-violet-700",
          features: [
            "All benefits of Gold Protection",
            "Zero Deductible (Franchise 0)",
            "Full Protection against Theft & Vandalism",
            "Personal Accident Insurance (PAI) for driver",
            "Immediate replacement vehicle in case of incident"
          ],
          deductible: "Security Deposit (Caution): 0 DH"
        }
      ]
    },
    checklist: {
      title: "Quick Coverage Breakdown",
      subtitle: "See at a glance what is included and excluded in our protection options.",
      covered: "What's Covered",
      notCovered: "What's Not Covered",
      coveredList: [
        "Third-party bodily injury and property damage",
        "Collision damage to vehicle bodywork (subject to deductible)",
        "Theft of the vehicle (with police report and keys returned)",
        "Windshield damage (Gold and Platinum plans only)",
        "Tire punctures and standard rim scuffs (Gold and Platinum plans only)",
        "24/7 vehicle towing and replacement assistance"
      ],
      notCoveredList: [
        "Loss or damage of vehicle keys (Charged at replacement value)",
        "Interior burns, stains, or severe upholstery damage",
        "Driving under the influence of alcohol, drugs, or without a valid license",
        "Personal belongings left inside the vehicle",
        "Using incorrect fuel type (Engine flush costs apply)",
        "Off-road driving (Unpaved roads are strictly prohibited)"
      ]
    },
    details: {
      title: "Coverage Details & Definitions",
      subtitle: "Understand exactly what each insurance module covers during your trip.",
      sections: [
        {
          title: "1. Third-Party Liability (Responsabilité Civile)",
          icon: ShieldCheck,
          desc: "Mandatory civil liability insurance covering material and bodily damage caused to third parties in the event of an accident where you are at fault. This is built into all options automatically."
        },
        {
          title: "2. Collision Damage Waiver (CDW)",
          icon: Car,
          desc: "Reduces your financial responsibility in case of damage to the car. Under Basic Protection, a deductible is payable. Gold reduces this, and Platinum completely waives it."
        },
        {
          title: "3. Theft and Vandalism Protection",
          icon: Lock,
          desc: "Covers you in the event of vehicle theft or attempted theft. You must present the vehicle keys and an official police report within 24 hours. The deductible applies unless Platinum is selected."
        },
        {
          title: "4. Glass, Windshield & Tire Coverage",
          icon: Eye,
          desc: "Covers chips, cracks, and full breaks to the windshield, side windows, and rear window, as well as tire punctures. Excluded from Basic, included in Gold and Platinum."
        }
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Clear answers to help you navigate car rental insurance in Morocco.",
      items: [
        {
          q: "What is a deductible (franchise)?",
          a: "A deductible is the maximum amount you are responsible for paying in the event of damage to or theft of the vehicle. If the repair cost is lower than the deductible, you pay the repair cost. If it is higher, you only pay the deductible."
        },
        {
          q: "Do I need to leave a security deposit (caution)?",
          a: "Yes. For Basic and Gold protection, a pre-authorization holds the deductible amount on your credit card. For Platinum Zero-Deductible, no deposit is frozen on your card, but a card imprint is kept for traffic fines or fuel gaps."
        },
        {
          q: "What should I do in case of an accident?",
          a: "1. Call our 24/7 hotline immediately.\n2. Contact the police/gendarmerie to fill out a joint accident report (Constat à l'amiable).\n3. Take photos of the scene and vehicles.\n4. Send us the report within 24 hours."
        },
        {
          q: "Are personal belongings inside the car covered?",
          a: "No, standard car insurance does not cover personal effects or luggage left in the vehicle. We recommend keeping valuable items out of sight or taking them with you."
        }
      ]
    },
    cta: {
      title: "Need Assistance?",
      desc: "Our customer support team is available 24/7 to answer your insurance questions and handle active claims.",
      button: "Contact Support"
    }
  },
  fr: {
    meta: {
      badge: "Assurances & Protection",
      title: "Conduisez en toute",
      titleAccent: "Tranquillité d'Esprit",
      subtitle: "Choisissez votre niveau de protection. La couverture de base est incluse dans toutes les réservations, avec des options supérieures pour une sécurité maximale.",
      lastUpdated: "Dernière mise à jour : Juin 2026",
      duration: "5 min de lecture",
      docType: "Réf Doc : PP-INS-2026"
    },
    quickStats: [
      { label: "Assistance Routière", value: "24h/24 & 7j/7 Incluse" },
      { label: "Gestion des Sinistres", value: "100% Numérique" },
      { label: "Niveaux de Protection", value: "3 Options" }
    ],
    tiers: {
      title: "Comparez les Niveaux de Protection",
      subtitle: "Sélectionnez la formule la plus adaptée à vos besoins au Maroc",
      items: [
        {
          id: "basic",
          name: "Protection Basique",
          badge: "Incluse",
          price: "Incluse dans le tarif",
          desc: "Protection standard requise par la loi, couvrant la responsabilité civile et les dommages de base au véhicule.",
          popular: false,
          gradient: "from-slate-500 to-slate-700",
          features: [
            "Responsabilité Civile (Tiers obligatoire)",
            "Protection Vol de base (Franchise applicable)",
            "Protection Collision de base (Franchise applicable)",
            "Remorquage standard 24h/24"
          ],
          deductible: "Dépôt de Garantie (Caution) : 15 000 DH"
        },
        {
          id: "gold",
          name: "Protection Gold",
          badge: "Recommandée",
          price: "150 DH / jour",
          desc: "Réduit considérablement votre franchise et ajoute des couvertures essentielles pour les vitres, les pneus et les petites rayures.",
          popular: true,
          gradient: "from-[#f39c12] to-amber-600",
          features: [
            "Tous les avantages de la Protection Basique",
            "Franchise réduite de 65%",
            "Garantie Bris de Glace & Optiques",
            "Protection Pneus & Jantes (crevaison)",
            "Assistance routière prioritaire"
          ],
          deductible: "Dépôt de Garantie (Caution) : 5 000 DH"
        },
        {
          id: "platinum",
          name: "Platinum Franchise Zéro",
          badge: "Premium",
          price: "300 DH / jour",
          desc: "Zéro franchise en cas de dommage, de vol ou de bris de glace. Une sérénité absolue pour votre voyage de luxe.",
          popular: false,
          gradient: "from-indigo-600 to-violet-700",
          features: [
            "Tous les avantages de la Protection Gold",
            "Zéro Franchise (Responsabilité 0)",
            "Couverture Vol & Vandalisme intégrale",
            "Assurance Personnes Transportées (PAI) conducteur",
            "Véhicule de remplacement immédiat en cas de pépin"
          ],
          deductible: "Dépôt de Garantie (Caution) : 0 DH"
        }
      ]
    },
    checklist: {
      title: "Détail Rapide des Garanties",
      subtitle: "Découvrez en un coup d'œil ce qui est inclus ou exclu de nos formules de protection.",
      covered: "Ce qui est couvert",
      notCovered: "Ce qui est exclu",
      coveredList: [
        "Dommages corporels et matériels causés aux tiers",
        "Dommages de collision sur la carrosserie du véhicule (avec franchise)",
        "Vol du véhicule (avec dépôt de plainte et restitution des clés)",
        "Bris de glace et optiques de phares (formules Gold & Platinum)",
        "Crevaison des pneus et rayures de jantes (formules Gold & Platinum)",
        "Assistance remorquage 24h/24 et véhicule de remplacement"
      ],
      notCoveredList: [
        "Perte ou détérioration des clés du véhicule (facturée au coût réel)",
        "Brûlures, taches ou déchirures sévères à l'intérieur du véhicule",
        "Conduite sous l'emprise d'alcool, de drogues ou sans permis valide",
        "Effets personnels et bagages laissés à l'intérieur du véhicule",
        "Erreur de carburant (frais de vidange et nettoyage moteur)",
        "Conduite hors route (pistes non goudronnées strictement interdites)"
      ]
    },
    details: {
      title: "Détails des Garanties & Définitions",
      subtitle: "Comprenez précisément le fonctionnement de chaque garantie lors de votre location.",
      sections: [
        {
          title: "1. Responsabilité Civile (Tiers)",
          icon: ShieldCheck,
          desc: "Assurance obligatoire couvrant les dommages matériels et corporels causés aux tiers lors d'un accident dont vous êtes responsable. Incluse automatiquement dans toutes nos offres."
        },
        {
          title: "2. Garantie Dommages (CDW)",
          icon: Car,
          desc: "Limite votre responsabilité financière en cas de dégâts sur la carrosserie du véhicule. Une franchise reste due en formule Basique, réduite en Gold, et supprimée en Platinum."
        },
        {
          title: "3. Vol et Vandalisme",
          icon: Lock,
          desc: "Vous protège en cas de vol du véhicule. Vous devez remettre les clés et le rapport de police officiel sous 24h. La franchise s'applique sauf en cas de souscription à la formule Platinum."
        },
        {
          title: "4. Bris de Glace & Pneus",
          icon: Eye,
          desc: "Couvre les impacts et fissures sur le pare-brise, les vitres latérales et la lunette arrière, ainsi que les crevaisons. Exclus en Basique, inclus en Gold et Platinum."
        }
      ]
    },
    faq: {
      title: "Foire Aux Questions",
      subtitle: "Des réponses claires pour vous guider sur les assurances de location de voitures au Maroc.",
      items: [
        {
          q: "Qu'est-ce qu'une franchise ?",
          a: "La franchise est le montant maximum à votre charge en cas de sinistre responsable ou sans tiers identifié. Si le montant des réparations est inférieur à la franchise, vous payez le coût exact. S'il est supérieur, vous ne payez que le montant de la franchise."
        },
        {
          q: "Dois-je laisser un dépôt de garantie (caution) ?",
          a: "Oui. Pour les protections Basique et Gold, une pré-autorisation du montant de la franchise est effectuée sur votre carte de crédit. Pour la formule Platinum Franchise Zéro, aucun dépôt n'est bloqué, seule une empreinte de carte est conservée pour les amendes ou les écarts de carburant."
        },
        {
          q: "Que faire en cas d'accident ?",
          a: "1. Contactez immédiatement notre assistance 24h/24.\n2. Appelez la police/gendarmerie ou établissez un constat à l'amiable.\n3. Prenez des photos des véhicules et des lieux.\n4. Transmettez-nous le constat signé sous 24h."
        },
        {
          q: "Mes effets personnels dans la voiture sont-ils assurés ?",
          a: "Non, les assurances de location ne couvrent pas les objets personnels ou bagages laissés à l'intérieur du véhicule. Nous vous conseillons de ne rien laisser de valeur en évidence."
        }
      ]
    },
    cta: {
      title: "Besoin d'aide ?",
      desc: "Notre service client est disponible 24h/24 & 7j/7 pour répondre à toutes vos questions d'assurance ou déclarer un sinistre.",
      button: "Contacter le Support"
    }
  },
  ar: {
    meta: {
      badge: "التأمين والحماية",
      title: "قد سيارتك بكل",
      titleAccent: "راحة بال وطمأنينة",
      subtitle: "اختر مستوى الحماية المناسب لك. التأمين الأساسي مشمول في جميع الحجوزات مع إمكانية الترقية للحصول على أقصى درجات الأمان.",
      lastUpdated: "آخر تحديث: يونيو 2026",
      duration: "قراءة في 5 دقائق",
      docType: "مرجع المستند: PP-INS-2026"
    },
    quickStats: [
      { label: "المساعدة على الطريق", value: "24/7 مشمولة" },
      { label: "معالجة المطالبات", value: "رقمية 100%" },
      { label: "فئات الحماية", value: "3 مستويات" }
    ],
    tiers: {
      title: "مقارنة مستويات الحماية",
      subtitle: "اختر التغطية التي تلائم احتياجات قيادتك في المغرب",
      items: [
        {
          id: "basic",
          name: "الحماية الأساسية",
          badge: "مشمول",
          price: "مشمول في قيمة الحجز",
          desc: "التغطية القانونية القياسية الإلزامية التي تغطي المسؤولية المدنية والأضرار الأساسية للمركبة.",
          popular: false,
          gradient: "from-slate-500 to-slate-700",
          features: [
            "المسؤولية المدنية تجاه الغير",
            "تأمين السرقة الأساسي (يتم تطبيق مبلغ التحمل)",
            "تأمين الحوادث الأساسي (يتم تطبيق مبلغ التحمل)",
            "خدمة سحب قياسية على مدار الساعة"
          ],
          deductible: "مبلغ التأمين (الضمان): 15,000 درهم"
        },
        {
          id: "gold",
          name: "الحماية الذهبية",
          badge: "موصى به",
          price: "150 درهم / يوم",
          desc: "تخفيض كبير في قيمة التحمل وتغطية إضافية للزجاج والإطارات والأضرار الطفيفة.",
          popular: true,
          gradient: "from-[#f39c12] to-amber-600",
          features: [
            "جميع مزايا الحماية الأساسية",
            "تخفيض مبلغ التحمل بنسبة 65%",
            "تغطية زجاج السيارة والزجاج الأمامي والمصابيح",
            "تغطية ثقب الإطارات وحماية العجلات",
            "دعم أولوية المساعدة على الطريق"
          ],
          deductible: "مبلغ التأمين (الضمان): 5,000 درهم"
        },
        {
          id: "platinum",
          name: "الحماية البلاتينية بدون تحمل",
          badge: "مميز",
          price: "300 درهم / يوم",
          desc: "إعفاء كامل من المسؤولية عن أي ضرر، سرقة أو إصلاح زجاج السيارة. راحة بال مطلقة لرحلتك الفاخرة.",
          popular: false,
          gradient: "from-indigo-600 to-violet-700",
          features: [
            "جميع مزايا الحماية الذهبية",
            "إعفاء كامل من مبلغ التحمل (فرنشيز 0)",
            "حماية شاملة ضد السرقة والتخريب",
            "تأمين الحوادث الشخصية (PAI) للسائق والركاب",
            "توفير سيارة بديلة فورية في حال حدوث عطل"
          ],
          deductible: "مبلغ التأمين (الضمان): 0 درهم"
        }
      ]
    },
    checklist: {
      title: "تفاصيل التغطيات السريعة",
      subtitle: "شاهد بنظرة سريعة ما هو مشمول وما هو مستثنى في خيارات الحماية لدينا.",
      covered: "ما تغطيه الحماية",
      notCovered: "المستثنيات من التغطية",
      coveredList: [
        "الإصابات الجسدية والأضرار المادية للآخرين",
        "أضرار اصطدام هيكل السيارة (يخضع لمبلغ التحمل)",
        "سرقة السيارة (مع تقديم تقرير الشرطة وإعادة المفاتيح)",
        "أضرار الزجاج الأمامي والنوافذ (الباقة الذهبية والبلاتينية فقط)",
        "ثقوب الإطارات والخدوش الطفيفة للعجلات (الذهبية والبلاتينية فقط)",
        "خدمة سحب السيارة 24/7 وتوفير سيارة بديلة"
      ],
      notCoveredList: [
        "فقدان أو تلف مفاتيح السيارة (يتم احتساب تكلفة الاستبدال)",
        "الحروق أو البقع أو الأضرار الجسيمة للمقاعد والفرش الداخلي",
        "القيادة تحت تأثير الكحول أو المواد المخدرة أو بدون رخصة قيادة سارية",
        "الأغراض والممتلكات الشخصية المتروكة داخل السيارة",
        "استخدام نوع وقود خاطئ (يتم تحميل تكاليف تفريغ وتنظيف المحرك)",
        "القيادة في الطرق الوعرة وغير المعبدة بالكامل"
      ]
    },
    details: {
      title: "تفاصيل التغطية والتعاريف",
      subtitle: "افهم بالتفصيل ما يغطيه كل خيار حماية أثناء رحلتك.",
      sections: [
        {
          title: "1. المسؤولية تجاه الغير",
          icon: ShieldCheck,
          desc: "التأمين الإلزامي الذي يغطي الأضرار المادية والجسدية التي تلحق بالآخرين في حال وقوع حادث تسببت فيه. مشمول تلقائيًا في كل الباقات."
        },
        {
          title: "2. الإعفاء من أضرار الاصطدام (CDW)",
          icon: Car,
          desc: "يقلل من مسؤوليتك المالية في حال حدوث أضرار لهيكل السيارة. في الحماية الأساسية يتم دفع مبلغ تحمل، ويقل في الذهبية، بينما يعفى منه تمامًا في البلاتينية."
        },
        {
          title: "3. الحماية ضد السرقة والتخريب",
          icon: Lock,
          desc: "يغطيك في حال سرقة السيارة أو محاولة السرقة. يجب تسليم مفاتيح السيارة وتقديم تقرير شرطة رسمي خلال 24 ساعة. يطبق مبلغ التحمل إلا في البلاتينية."
        },
        {
          title: "4. تغطية الزجاج والإطارات",
          icon: Eye,
          desc: "يغطي الشروخ والكسور في الزجاج الأمامي والنوافذ والمصابيح، بالإضافة لثقوب الإطارات. مستثنى من الأساسية ومشمول في الذهبية والبلاتينية."
        }
      ]
    },
    faq: {
      title: "الأسئلة الشائعة",
      subtitle: "إجابات واضحة لمساعدتك في فهم تأمين تأجير السيارات بالمغرب.",
      items: [
        {
          q: "ما هو مبلغ التحمل (الفرنشيز)؟",
          a: "مبلغ التحمل هو الحد الأقصى للمسؤولية المالية التي تتحملها في حال وقوع حادث أو سرقة للمركبة. إذا كانت تكلفة الإصلاح أقل من مبلغ التحمل، تدفع تكلفة الإصلاح الفعلية فقط. وإذا كانت أكثر، تدفع فقط قيمة مبلغ التحمل المتفق عليه."
        },
        {
          q: "هل أحتاج لترك مبلغ ضمان (ديبوزيت)؟",
          a: "نعم. للحماية الأساسية والذهبية يتم حجز مبلغ التحمل مؤقتًا من بطاقتك الائتمانية. أما للحماية البلاتينية (صفر تحمل)، فلن يتم حجز أي مبلغ في بطاقتك، ولكن يتم الاحتفاظ ببصمة البطاقة للغرامات المرورية أو نقص الوقود."
        },
        {
          q: "ماذا يجب أن أفعل في حال وقوع حادث؟",
          a: "1. اتصل فورًا بخط المساعدة على مدار الساعة.\n2. اتصل بالشرطة/الدرك الملكي لكتابة تقرير حادث مشترك (معاينة ودية).\n3. التقط صورًا لموقع الحادث والمركبات.\n4. أرسل إلينا تقرير الحادث المكتوب خلال 24 ساعة."
        },
        {
          q: "هل الممتلكات الشخصية داخل السيارة مغطاة؟",
          a: "لا، التأمين القياسي للسيارة لا يغطي الممتلكات الشخصية أو الحقائب المتروكة داخل السيارة. ننصحك بعدم ترك أي أشياء ثمينة ظاهرة للعيان أو أخذها معك دائمًا."
        }
      ]
    },
    cta: {
      title: "هل تحتاج مساعدة؟",
      desc: "فريق الدعم لدينا متوفر على مدار الساعة طوال أيام الأسبوع للإجابة على جميع استفسارات التأمين أو التبليغ عن الحوادث.",
      button: "اتصل بالدعم"
    }
  }
};

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 4,
    })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/10 dark:bg-[#f39c12]/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function InsurancePage() {
  const { locale, t } = useI18n();
  // Safe fallback to 'fr' or 'en' if locale isn't fully defined
  const currentLang = (locale === "ar" || locale === "en" || locale === "fr") ? locale : "fr";
  const content = useMemo(() => CONTENT[currentLang], [currentLang]);

  const [selectedTier, setSelectedTier] = useState<string>("gold");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isRtl = currentLang === "ar";

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500 pb-20" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
        <Particles />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-14">
          <BackButton />
          
          <div className="flex justify-between items-start gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">{content.meta.badge}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {content.meta.title}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f39c12] to-amber-300">
                  {content.meta.titleAccent}
                </span>
              </h1>
              <p className="text-white/70 text-base md:text-lg font-medium mt-4 leading-relaxed">
                {content.meta.subtitle}
              </p>
            </motion.div>

            {/* Quick Actions (Print / Share) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:flex flex-col gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 mt-12"
            >
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-white hover:bg-white/10 text-xs font-bold transition-all"
              >
                <Printer className="w-4 h-4" />
                {currentLang === "en" ? "Print Policy" : currentLang === "fr" ? "Imprimer" : "طباعة"}
              </button>
            </motion.div>
          </div>

          {/* Quick Info Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/10"
          >
            {content.quickStats.map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.1em]">{stat.label}</p>
                <p className="text-white/95 text-lg font-extrabold mt-1">{stat.value}</p>
              </div>
            ))}
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 flex flex-col justify-center">
              <p className="text-white/40 text-xs font-bold uppercase tracking-[0.1em]">{content.meta.docType}</p>
              <p className="text-[#f39c12] text-xs font-bold mt-1 uppercase tracking-wider">{content.meta.lastUpdated}</p>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-[#F0F3FA] dark:to-[#070b14] pointer-events-none" />
      </div>

      {/* ── Protection Packages Selector ── */}
      <div className="max-w-6xl mx-auto px-6 mt-12 relative z-10">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-[#395886] dark:text-white"
          >
            {content.tiers.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#638ECB] dark:text-[#94A3B8] font-semibold text-sm mt-2"
          >
            {content.tiers.subtitle}
          </motion.p>
        </div>

        {/* Protection Tier Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {content.tiers.items.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4 }}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative cursor-pointer rounded-3xl border transition-all duration-500 overflow-hidden flex flex-col justify-between p-6 md:p-8 ${
                  isSelected
                    ? "border-[#395886] dark:border-[#f39c12] bg-white dark:bg-[#0f1729] shadow-2xl scale-[1.02] ring-2 ring-[#395886]/20 dark:ring-[#f39c12]/20"
                    : "border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-white/70 dark:bg-[#0f1729]/40 hover:bg-white dark:hover:bg-[#0f1729] shadow-sm hover:shadow-lg"
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className={`absolute top-0 ${isRtl ? "left-0 rounded-br-2xl" : "right-0 rounded-bl-2xl"} bg-gradient-to-r from-[#f39c12] to-amber-500 text-[#070b14] text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 shadow`}>
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {!tier.popular && (
                        <span className="inline-block text-[10px] uppercase tracking-[0.15em] font-extrabold text-[#638ECB] dark:text-[#94A3B8] mb-1">
                          {tier.badge}
                        </span>
                      )}
                      <h3 className="text-xl font-extrabold text-[#395886] dark:text-white flex items-center gap-2">
                        {tier.id === "platinum" && <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />}
                        {tier.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#395886] to-[#638ECB] dark:from-[#f39c12] dark:to-amber-300">
                    {tier.price}
                  </p>
                  
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 min-h-[40px] leading-relaxed">
                    {tier.desc}
                  </p>

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-5" />

                  {/* Features list */}
                  <ul className="space-y-3.5">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-gradient-to-br ${tier.gradient} shadow-md`}>
                          <Check className="w-3 h-3 text-white" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deductible info bottom */}
                <div className="mt-8 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#395886] dark:text-[#f39c12]">
                    <Info className="w-4 h-4" />
                    <span>{tier.deductible}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Covered vs Excluded Checklist ── */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <div className="bg-white/80 dark:bg-[#0f1729]/80 backdrop-blur-md rounded-3xl border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 p-6 md:p-10 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-[#395886] dark:text-white flex items-center justify-center gap-2">
              <FileCheck className="w-6 h-6 text-[#f39c12]" />
              {content.checklist.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs mt-1">
              {content.checklist.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* What's Covered */}
            <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-5 rounded-2xl border border-emerald-500/10">
              <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">✓</div>
                {content.checklist.covered}
              </h3>
              <ul className="space-y-3.5">
                {content.checklist.coveredList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-500 shrink-0 select-none font-bold mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Not Covered */}
            <div className="bg-rose-50/40 dark:bg-rose-950/10 p-5 rounded-2xl border border-rose-500/10">
              <h3 className="text-lg font-black text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">✗</div>
                {content.checklist.notCovered}
              </h3>
              <ul className="space-y-3.5">
                {content.checklist.notCoveredList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-rose-500 shrink-0 select-none font-bold mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── In-Depth Insurance Modules Details ── */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#395886] dark:text-white">
            {content.details.title}
          </h2>
          <p className="text-[#638ECB] dark:text-[#94A3B8] font-semibold text-sm mt-1">
            {content.details.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.details.sections.map((section, idx) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-[#0f1729]/60 border border-[#D5DEEF]/40 dark:border-[#1e293b]/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center text-[#395886] dark:text-[#f39c12]">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-base text-[#395886] dark:text-white">
                    {section.title}
                  </h3>
                </div>
                <p className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  {section.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── FAQ Section ── */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#395886] dark:text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#395886] dark:text-[#f39c12]" />
            {content.faq.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-semibold text-xs mt-1">
            {content.faq.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {content.faq.items.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <motion.div
                key={idx}
                layout
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#638ECB]/30 bg-white dark:bg-[#0f1729] shadow-md"
                    : "border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-white/50 dark:bg-[#0f1729]/20"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm text-[#395886] dark:text-white"
                >
                  <span className={isRtl ? "text-right" : "text-left"}>{item.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 w-8 h-8 rounded-lg bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center text-[#638ECB] dark:text-[#94A3B8]"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 mt-1 whitespace-pre-line">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Premium Support Banner / CTA ── */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#395886] to-[#1d3560] p-8 md:p-10 border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-white/5 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative max-w-lg text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black text-white flex items-center justify-center md:justify-start gap-2">
              <PhoneCall className="w-5 h-5 text-[#f39c12]" />
              {content.cta.title}
            </h3>
            <p className="text-white/70 text-xs md:text-sm font-semibold mt-2 leading-relaxed">
              {content.cta.desc}
            </p>
          </div>
          <motion.a
            href="tel:+212500000000"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 bg-gradient-to-r from-[#f39c12] to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold px-6 py-3.5 rounded-xl text-xs shadow-lg uppercase tracking-wider transition-all"
          >
            {content.cta.button}
          </motion.a>
        </div>
      </div>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-xl bg-gradient-to-br from-[#395886] to-[#2b4c7e] dark:from-[#f39c12] dark:to-[#d68910] text-white shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
