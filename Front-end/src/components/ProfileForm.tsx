"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "@/lib/authContext";
import { profileImageUrl, vehicleImageUrl } from "@/lib/media";
import { addCin, addPermi, updateProfileName, updateProfilePicture, updateProfilePassword } from "@/lib/profileApi";
import type { ApiError } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Shield, FileText, Upload, CheckCircle, User, Mail, Lock, Camera, IdCard, Fingerprint, Sparkles, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function UploadZone({
  label, file, existingUrl, onChange, hasImage, bgType,
}: {
  label: string; file: File | null; existingUrl?: string | null;
  onChange: (f: File | null) => void; hasImage?: boolean; bgType?: "license" | "cin";
}) {
  const { t } = useI18n();
  const [dragging, setDragging] = useState(false);

  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all h-40 overflow-hidden
        ${dragging ? "border-[#395886] bg-[#eef2fb] shadow-inner" : "border-[#D5DEEF]/70 bg-white/50 hover:border-[#638ECB]/50 hover:bg-[#F0F3FA]/80 hover:shadow-md"}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onChange(f); }}
    >
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      {existingUrl && hasImage ? (
        <>
          <img src={existingUrl} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-30" />
          <div className="relative z-10 flex flex-col items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#638ECB] to-[#395886] flex items-center justify-center shadow-md">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-extrabold text-[#395886]">{label}</span>
            <span className="text-[10px] font-semibold text-[#638ECB]/70">{t("profile.tap_to_replace")}</span>
          </div>
        </>
      ) : file ? (
        <div className="flex flex-col items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3">
          <CheckCircle className="w-7 h-7 text-emerald-500" />
          <span className="text-xs font-bold text-gray-700 text-center px-2 truncate max-w-[140px]">{file.name}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D5DEEF] to-[#bccbe0] flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#395886]" />
          </div>
          <span className="text-xs font-extrabold text-[#395886]">{label}</span>
          <span className="text-[10px] font-semibold text-[#638ECB]/60">{t("profile.file_types")}</span>
        </div>
      )}
    </motion.label>
  );
}

export default function ProfileForm() {
  const { t } = useI18n();
  const { user, refreshUser } = useAuth();

  const initial = useMemo(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    profile_pic: user?.profile_pic ?? null,
    cin_recto: user?.cin_recto ?? null,
    cin_verso: user?.cin_verso ?? null,
    permi_recto: user?.permi_recto ?? null,
    permi_verso: user?.permi_verso ?? null,
  }), [user]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initial.name) {
      setName(initial.name);
      setEmail(initial.email);
      initialized.current = true;
    }
  }, [initial.name, initial.email]);

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmePassword, setConfirmePassword] = useState("");

  const [showPw, setShowPw] = useState(false);

  const [basicSubmitting, setBasicSubmitting] = useState(false);
  const [basicError, setBasicError] = useState<string | null>(null);
  const [basicSuccess, setBasicSuccess] = useState<string | null>(null);

  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const [cinRectoFile, setCinRectoFile] = useState<File | null>(null);
  const [cinVersoFile, setCinVersoFile] = useState<File | null>(null);
  const [permiRectoFile, setPermiRectoFile] = useState<File | null>(null);
  const [permiVersoFile, setPermiVersoFile] = useState<File | null>(null);

  const [docsSubmitting, setDocsSubmitting] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [docsSuccess, setDocsSuccess] = useState<string | null>(null);

  async function onUpdateBasic(e: React.FormEvent) {
    e.preventDefault();
    setBasicSubmitting(true);
    setBasicError(null);
    setBasicSuccess(null);
    try {
      await updateProfileName(name.trim());
      if (profilePicFile) {
        await updateProfilePicture(profilePicFile);
      }
      setBasicSuccess(t("profile.success"));
      setProfilePicFile(null);
      await refreshUser();
    } catch (err) {
      setBasicError((err as ApiError)?.message ?? t("profile.error"));
    } finally {
      setBasicSubmitting(false);
    }
  }

  async function onUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwSubmitting(true);
    setPwError(null);
    setPwSuccess(null);
    try {
      await updateProfilePassword({
        old_password: currentPassword,
        new_password: newPassword,
        confirme_password: confirmePassword,
      });
      setPwSuccess(t("profile.password_success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmePassword("");
    } catch (err) {
      setPwError((err as ApiError)?.message ?? t("profile.password_error"));
    } finally {
      setPwSubmitting(false);
    }
  }

  async function onUploadPermi(e: React.FormEvent) {
    e.preventDefault();
    if (!permiRectoFile || !permiVersoFile) { setDocsError(t("profile.select_both")); return; }
    setDocsSubmitting(true); setDocsError(null); setDocsSuccess(null);
    try {
      await addPermi(permiRectoFile, permiVersoFile);
      setDocsSuccess(t("profile.docs_success_permis"));
      setPermiRectoFile(null); setPermiVersoFile(null);
      await refreshUser();
    } catch (err) {
      setDocsError((err as ApiError)?.message ?? t("profile.docs_error"));
    } finally { setDocsSubmitting(false); }
  }

  async function onUploadCin(e: React.FormEvent) {
    e.preventDefault();
    if (!cinRectoFile || !cinVersoFile) { setDocsError(t("profile.select_both")); return; }
    setDocsSubmitting(true); setDocsError(null); setDocsSuccess(null);
    try {
      await addCin(cinRectoFile, cinVersoFile);
      setDocsSuccess(t("profile.docs_success_cin"));
      setCinRectoFile(null); setCinVersoFile(null);
      await refreshUser();
    } catch (err) {
      setDocsError((err as ApiError)?.message ?? t("profile.docs_error"));
    } finally { setDocsSubmitting(false); }
  }

  const profilePicSrc = initial.profile_pic ? profileImageUrl(initial.profile_pic) : null;
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "?";

  const docsComplete = !!(initial.cin_recto && initial.cin_verso && initial.permi_recto && initial.permi_verso);

  return (
    <div className="min-h-screen bg-[#F0F3FA]">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
        <div className="relative max-w-4xl mx-auto px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-6"
          >
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-2xl bg-gradient-to-br from-[#638ECB] to-[#395886]">
                {profilePicSrc ? (
                  <img src={profilePicSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-black text-white">{userInitial}</span>
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-[#f39c12] to-[#e08e0b] flex items-center justify-center cursor-pointer shadow-lg shadow-[#f39c12]/30 hover:scale-110 transition-transform border-2 border-white">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfilePicFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#f39c12]" />
                <span className="text-white/60 text-xs font-bold uppercase tracking-[0.15em]">{t("profile.badge")}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight truncate">{initial.name || t("profile.welcome")}</h1>
              <p className="text-white/60 text-sm font-semibold mt-1">{initial.email}</p>
              {profilePicFile && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block mt-2 text-[10px] font-extrabold text-[#f39c12] bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full"
                >
                  {t("profile.photo_saved")}
                </motion.span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-6 relative z-10 pb-12 flex flex-col gap-6">
        {/* ── Personal Details ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl border border-[#D5DEEF]/50 bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5 overflow-hidden">
            <div className="px-7 py-5 border-b border-[#D5DEEF]/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#638ECB] to-[#395886] flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-[#395886] text-sm">{t("profile.personal_details")}</h2>
                <p className="text-[11px] font-semibold text-[#638ECB]/70">{t("profile.personal_subtitle")}</p>
              </div>
            </div>

            <form onSubmit={onUpdateBasic} className="px-7 py-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold text-[#638ECB] uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
                      <User className="w-3 h-3" /> {t("profile.full_name")}
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border-2 border-[#D5DEEF]/60 rounded-xl px-4 py-3 text-sm font-bold text-[#395886] placeholder:text-[#638ECB]/40 focus:outline-none focus:border-[#638ECB]/50 focus:ring-4 focus:ring-[#638ECB]/10 bg-white/80 transition-all"
                      type="text"
                      placeholder={t("profile.name_placeholder")}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold text-[#638ECB] uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
                      <Mail className="w-3 h-3" /> {t("profile.email")}
                    </label>
                    <div className="relative">
                      <input
                        value={email}
                        disabled
                        className="w-full border-2 border-[#D5DEEF]/60 rounded-xl px-4 py-3 text-sm font-bold bg-gray-50/50 text-[#638ECB]/60 cursor-not-allowed"
                        type="email"
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-[#638ECB]/50 mt-1.5">{t("profile.email_contact")}</p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {basicError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                    <div className="text-sm text-rose-700 bg-rose-50/80 border border-rose-200/60 rounded-xl px-4 py-3 font-bold">{basicError}</div>
                  </motion.div>
                )}
                {basicSuccess && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                    <div className="text-sm text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> {basicSuccess}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" disabled={basicSubmitting}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white text-sm font-extrabold shadow-lg shadow-[#395886]/20 hover:shadow-xl disabled:opacity-50 transition-all"
                >
                  {basicSubmitting ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("profile.saving")}</span>
                  ) : t("profile.save")}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* ── Security ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl border border-[#D5DEEF]/50 bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5 overflow-hidden">
            <div className="px-7 py-5 border-b border-[#D5DEEF]/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-[#395886] text-sm">{t("profile.security")}</h2>
                <p className="text-[11px] font-semibold text-[#638ECB]/70">{t("profile.security_subtitle")}</p>
              </div>
            </div>

            <form onSubmit={onUpdatePassword} className="px-7 py-6 flex flex-col gap-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-extrabold text-[#638ECB] uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
                    <Lock className="w-3 h-3" /> {t("profile.current")}
                  </label>
                  <div className="relative">
                    <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••"
                      className="w-full border-2 border-[#D5DEEF]/60 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-[#395886] placeholder:text-[#638ECB]/40 focus:outline-none focus:border-[#638ECB]/50 focus:ring-4 focus:ring-[#638ECB]/10 bg-white/80 transition-all"
                      type={showPw ? "text" : "password"} />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-[#638ECB] uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
                    <Lock className="w-3 h-3" /> {t("profile.new")}
                  </label>
                  <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••"
                    className="w-full border-2 border-[#D5DEEF]/60 rounded-xl px-4 py-3 text-sm font-bold text-[#395886] placeholder:text-[#638ECB]/40 focus:outline-none focus:border-[#638ECB]/50 focus:ring-4 focus:ring-[#638ECB]/10 bg-white/80 transition-all"
                    type={showPw ? "text" : "password"} />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-[#638ECB] uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
                    <Lock className="w-3 h-3" /> {t("profile.confirm")}
                  </label>
                  <input value={confirmePassword} onChange={(e) => setConfirmePassword(e.target.value)} placeholder="••••••••"
                    className="w-full border-2 border-[#D5DEEF]/60 rounded-xl px-4 py-3 text-sm font-bold text-[#395886] placeholder:text-[#638ECB]/40 focus:outline-none focus:border-[#638ECB]/50 focus:ring-4 focus:ring-[#638ECB]/10 bg-white/80 transition-all"
                    type={showPw ? "text" : "password"} />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#638ECB] hover:text-[#395886] transition-colors">
                <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)}
                  className="w-4 h-4 accent-[#638ECB]" />
                <Eye className="w-3.5 h-3.5" /> {t("profile.show_passwords")}
              </label>

              <AnimatePresence>
                {pwError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="text-sm text-rose-700 bg-rose-50/80 border border-rose-200/60 rounded-xl px-4 py-3 font-bold">{pwError}</div>
                  </motion.div>
                )}
                {pwSuccess && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="text-sm text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> {pwSuccess}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" disabled={pwSubmitting}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-extrabold shadow-lg shadow-amber-500/20 hover:shadow-xl disabled:opacity-50 transition-all"
                >
                  {pwSubmitting ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t("profile.updating")}</span>
                  ) : t("profile.update_password")}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* ── Documents ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl border border-[#D5DEEF]/50 bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5 overflow-hidden">
            <div className="px-7 py-5 border-b border-[#D5DEEF]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                  <IdCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-[#395886] text-sm">{t("profile.documents")}</h2>
                  <p className="text-[11px] font-semibold text-[#638ECB]/70">{t("profile.documents_subtitle")}</p>
                </div>
              </div>
              {docsComplete ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-full px-4 py-2">
                  <CheckCircle className="w-3.5 h-3.5" /> {t("profile.all_verified")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-full px-4 py-2">
                  <Fingerprint className="w-3.5 h-3.5" /> {t("profile.pending")}
                </span>
              )}
            </div>

            <div className="px-7 py-6 flex flex-col gap-8">
              <AnimatePresence>
                {docsError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="text-sm text-rose-700 bg-rose-50/80 border border-rose-200/60 rounded-xl px-4 py-3 font-bold">{docsError}</div>
                  </motion.div>
                )}
                {docsSuccess && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="text-sm text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> {docsSuccess}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Driver's License */}
              <form onSubmit={onUploadPermi}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${initial.permi_recto && initial.permi_verso ? "bg-emerald-100" : "bg-[#F0F3FA]"}`}>
                      <FileText className={`w-4 h-4 ${initial.permi_recto && initial.permi_verso ? "text-emerald-600" : "text-[#638ECB]"}`} />
                    </div>
                    <span className="text-sm font-extrabold text-[#395886]">{t("profile.drivers_license")}</span>
                    {initial.permi_recto && initial.permi_verso && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <UploadZone label={t("profile.front_side")} file={permiRectoFile}
                    existingUrl={initial.permi_recto ? vehicleImageUrl(initial.permi_recto) : null}
                    onChange={setPermiRectoFile} hasImage={!!initial.permi_recto} bgType="license" />
                  <UploadZone label={t("profile.back_side")} file={permiVersoFile}
                    existingUrl={initial.permi_verso ? vehicleImageUrl(initial.permi_verso) : null}
                    onChange={setPermiVersoFile} hasImage={!!initial.permi_verso} bgType="license" />
                </div>
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" disabled={docsSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white text-xs font-extrabold shadow-lg shadow-[#395886]/20 hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {docsSubmitting ? t("profile.uploading") : t("profile.upload_license")}
                  </motion.button>
                </div>
              </form>

              <div className="border-t border-[#D5DEEF]/40" />

              {/* CIN / Passport */}
              <form onSubmit={onUploadCin}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${initial.cin_recto && initial.cin_verso ? "bg-emerald-100" : "bg-[#F0F3FA]"}`}>
                      <IdCard className={`w-4 h-4 ${initial.cin_recto && initial.cin_verso ? "text-emerald-600" : "text-[#638ECB]"}`} />
                    </div>
                    <span className="text-sm font-extrabold text-[#395886]">{t("profile.cin")}</span>
                    {initial.cin_recto && initial.cin_verso && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <UploadZone label={t("profile.front_side")} file={cinRectoFile}
                    existingUrl={initial.cin_recto ? vehicleImageUrl(initial.cin_recto) : null}
                    onChange={setCinRectoFile} hasImage={!!initial.cin_recto} bgType="cin" />
                  <UploadZone label={t("profile.back_side")} file={cinVersoFile}
                    existingUrl={initial.cin_verso ? vehicleImageUrl(initial.cin_verso) : null}
                    onChange={setCinVersoFile} hasImage={!!initial.cin_verso} bgType="cin" />
                </div>
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" disabled={docsSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white text-xs font-extrabold shadow-lg shadow-[#395886]/20 hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {docsSubmitting ? t("profile.uploading") : t("profile.upload_cin")}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
