"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useSettings } from "@/lib/SettingsContext";

function FooterLogo() {
  return (
    <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <img src="/logo-dark.png" alt="CARFORFAR logo" className="h-[70px] sm:h-14 md:h-20 w-auto object-contain select-none" />
    </div>
  );
}

export default function Footer() {
  const { t } = useI18n();
  const { settings } = useSettings();

  const phoneRaw = settings.phone || "+212524308038";
  const phoneDisplay = phoneRaw.startsWith("+212") ? `+212 ${phoneRaw.slice(4, 7)}-${phoneRaw.slice(7)}` : phoneRaw;
  const email = settings.email || "contact@carforfar.com";
  const conciergeUrl = "/a-propos";

  return (
    <footer className="bg-[#395886] dark:bg-[#050a14] px-8 py-16 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F39C12]/30 to-transparent" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <FooterLogo />
            <p className="text-[#D5DEEF]/60 text-sm max-w-xs mt-4 leading-relaxed">
              {t("footer.description")}
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            {[
              {
                title: t("footer.company"),
                links: [
                  { label: t("home.services.premium"), href: "/vehicules" },
                  { label: t("home.services.concierge"), href: conciergeUrl },
                  { label: t("home.services.insurance"), href: "/regles" },
                  { label: t("home.services.delivery"), href: "/vehicules" },
                ],
              },
              {
                title: t("footer.legal"),
                links: [
                  { label: t("rules.title"), href: "/regles" },
                  { label: t("footer.privacy"), href: "/privacy" },
                ],
              },
              {
                title: "Contact",
                links: [
                  { label: email, href: `mailto:${email}` },
                  { label: phoneDisplay, href: `tel:${phoneRaw.replace(/\s/g, "")}` },
                  { label: settings.address || t("home.map.location_text"), href: "#" },
                ],
              },
            ].map((col, ci) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: ci * 0.1 }}
              >
                <h4 className="text-[#F39C12] text-xs font-bold tracking-[0.15em] uppercase mb-4">{col.title}</h4>
                <div className="flex flex-col gap-2.5">
                  {col.links.map((linkObj) => (
                    <a key={linkObj.label} href={linkObj.href} className="text-[#D5DEEF]/70 text-sm hover:text-[#F39C12] transition-all duration-300 hover:translate-x-1 inline-block w-fit">
                      {linkObj.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-[#638ECB]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-[#D5DEEF]/40 text-xs">&copy; {new Date().getFullYear()} <a href="https://cdigital.ma/" target="_blank" rel="noopener noreferrer" className="text-[#D5DEEF]/60 hover:text-[#F39C12] transition-colors duration-200">Cdigital</a>. {t("footer.rights")}</p>
          <div className="flex gap-4">
            {[
              { name: "Instagram", url: "https://www.instagram.com/carforfar" },
              { name: "Facebook", url: "https://www.facebook.com/carforfar" },
              { name: "LinkedIn", url: "https://www.linkedin.com/company/carforfar" },
            ].map((s) => (
              <motion.a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="text-[#D5DEEF]/40 text-xs hover:text-[#F39C12] transition-colors duration-300"
              >
                {s.name}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
