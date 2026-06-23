"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/authContext";
import { API_BASE_URL } from "@/lib/config";
import { useClientMetadata } from "@/hooks/useClientMetadata";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLD } from "@/lib/json-ld";
import { PAGE_TITLES, SITE_URL } from "@/lib/seo";

export default function ContactPage() {
  const { t, locale } = useI18n();
  const typedLocale = locale as "fr" | "en" | "ar";
  useClientMetadata({ title: PAGE_TITLES.contact[typedLocale] || PAGE_TITLES.contact.fr });
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
    } catch {
      setError(t("contact.send_error"));
    } finally {
      setSending(false);
    }
  };

  const isRtl = locale === "ar";

  const contactInfo = [
    {
      icon: Mail,
      label: t("contact.email_label"),
      value: "contact@carforfar.ma",
      href: "mailto:contact@carforfar.ma",
    },
    {
      icon: Phone,
      label: t("contact.phone_label"),
      value: "+212 5XX XX XX XX",
      href: "tel:+2125XXXXXXXX",
    },
    {
      icon: MapPin,
      label: t("contact.address_label"),
      value: t("contact.address_value"),
      href: "#",
    },
    {
      icon: Clock,
      label: t("contact.hours_label"),
      value: t("contact.hours_value"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
        <div className="relative max-w-6xl mx-auto px-6 py-14">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">{t("contact.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {t("contact.title")}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f39c12] to-amber-300">
                {t("contact.title_accent")}
              </span>
            </h1>
            <p className="text-white/70 text-base font-semibold mt-3 max-w-xl">
              {t("contact.subtitle")}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10 pb-16">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-4">
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-[#0f1729] rounded-2xl p-5 border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#395886] dark:text-[#f39c12]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#638ECB]/60 dark:text-[#94A3B8]/60 uppercase tracking-wider mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm font-bold text-[#395886] dark:text-[#D5DEEF] hover:text-[#f39c12] transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-bold text-[#395886] dark:text-[#D5DEEF]">{item.value}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3 bg-white dark:bg-[#0f1729] rounded-2xl p-6 md:p-8 border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 shadow-sm"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-black text-[#395886] dark:text-[#D5DEEF] mb-2">{t("contact.success_title")}</h3>
                <p className="text-sm text-[#638ECB]/70 dark:text-[#94A3B8]/70 max-w-md">{t("contact.success_msg")}</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#395886] dark:text-[#D5DEEF] mb-1.5 uppercase tracking-wider">
                      {t("contact.form_name")}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      readOnly={!!user}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-[#F0F3FA]/50 dark:bg-[#1e293b]/30 text-sm font-semibold text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 focus:outline-none focus:ring-2 focus:ring-[#f39c12]/30 focus:border-[#f39c12]/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder={t("contact.form_name_placeholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#395886] dark:text-[#D5DEEF] mb-1.5 uppercase tracking-wider">
                      {t("contact.form_email")}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      readOnly={!!user}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-[#F0F3FA]/50 dark:bg-[#1e293b]/30 text-sm font-semibold text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 focus:outline-none focus:ring-2 focus:ring-[#f39c12]/30 focus:border-[#f39c12]/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder={t("contact.form_email_placeholder")}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#395886] dark:text-[#D5DEEF] mb-1.5 uppercase tracking-wider">
                    {t("contact.form_subject")}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-[#F0F3FA]/50 dark:bg-[#1e293b]/30 text-sm font-semibold text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 focus:outline-none focus:ring-2 focus:ring-[#f39c12]/30 focus:border-[#f39c12]/50 transition-all"
                    placeholder={t("contact.form_subject_placeholder")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#395886] dark:text-[#D5DEEF] mb-1.5 uppercase tracking-wider">
                    {t("contact.form_message")}
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-[#F0F3FA]/50 dark:bg-[#1e293b]/30 text-sm font-semibold text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 focus:outline-none focus:ring-2 focus:ring-[#f39c12]/30 focus:border-[#f39c12]/50 transition-all resize-none"
                    placeholder={t("contact.form_message_placeholder")}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: sending ? 1 : 1.02 }}
                  whileTap={{ scale: sending ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white font-extrabold py-3.5 rounded-xl text-sm tracking-wider uppercase shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? t("contact.form_sending") : t("contact.form_send")}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-white dark:bg-[#0f1729] rounded-2xl overflow-hidden border border-[#D5DEEF]/30 dark:border-[#1e293b]/70 shadow-sm"
        >
          <div className="p-5 border-b border-[#D5DEEF]/30 dark:border-[#1e293b]/70">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#f39c12]" />
              <h3 className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF]">{t("contact.map_title")}</h3>
            </div>
          </div>
          <div className="w-full h-[250px] bg-[#F0F3FA] dark:bg-[#1e293b]/50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13596.652022069702!2d-8.009416!3d31.629500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafee8f1f0f1f0f%3A0x0!2zMzHCsDM3JzQ2LjIiTiA4wrAwMCczMy45Ilc!5e0!3m2!1sfr!2sma!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="CARFORFAR Location"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
