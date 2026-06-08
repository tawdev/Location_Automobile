"use client";

import React, { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/adminSettingsApi";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function AdminSettingsPage() {
  const { t } = useI18n();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setAddress(s.address ?? "");
        setPhone(s.phone ?? "");
        setEmail(s.email ?? "");
      })
      .catch(() => setMessage({ type: "error", text: "Échec du chargement des paramètres." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateSettings({ address, phone, email });
      setMessage({ type: "success", text: "Paramètres mis à jour avec succès." });
      setDirty(false);
    } catch {
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#395886]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#395886] dark:text-[#D5DEEF] tracking-tight">
          Paramètres du site
        </h1>
        <p className="text-sm font-semibold text-[#638ECB] dark:text-[#94A3B8] mt-1">
          Gérez les informations de contact affichées sur le site.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-3.5 rounded-xl border text-sm font-bold ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-[#0f1729] rounded-3xl border border-[#D5DEEF]/60 dark:border-[#1e293b]/60 p-6 sm:p-8 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-wider">Adresse</label>
          <input
            type="text"
            className="rounded-xl border border-[#D5DEEF] dark:border-[#475569] bg-[#F0F3FA]/30 dark:bg-[#1e293b]/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#D5DEEF] focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
            value={address}
            onChange={(e) => { setAddress(e.target.value); setDirty(true); }}
            placeholder="Marrakech, Morocco"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-wider">Téléphone</label>
          <input
            type="text"
            className="rounded-xl border border-[#D5DEEF] dark:border-[#475569] bg-[#F0F3FA]/30 dark:bg-[#1e293b]/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#D5DEEF] focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setDirty(true); }}
            placeholder="+212 5XX XX XX XX"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-wider">Email</label>
          <input
            type="email"
            className="rounded-xl border border-[#D5DEEF] dark:border-[#475569] bg-[#F0F3FA]/30 dark:bg-[#1e293b]/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#D5DEEF] focus:ring-2 focus:ring-[#638ECB] focus:border-[#638ECB] outline-none"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setDirty(true); }}
            placeholder="contact@carforfar.ma"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="px-6 py-3 rounded-xl bg-[#395886] text-white font-bold text-sm transition-all hover:bg-[#395886]/90 hover:shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
