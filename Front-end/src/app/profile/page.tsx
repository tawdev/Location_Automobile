"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/authContext";
import { profileImageUrl, vehicleImageUrl } from "@/lib/media";
import { addCin, addPermi, updateProfileName, updateProfilePicture, updateProfilePassword, updateProfileDetails } from "@/lib/profileApi";
import { getMyReservations } from "@/lib/reservationsApi";
import type { ApiError } from "@/lib/apiClient";
import type { Reservation } from "@/lib/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { Shield, FileText, Upload, CheckCircle, User, Mail, Lock, Camera, IdCard, Fingerprint, ChevronRight, Sparkles, Eye, EyeOff, Circle, Smartphone, MapPin, Calendar, Car, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function UploadZone({
  label, file, existingUrl, onChange, hasImage, bgType, tapReplaceText, formatsText,
}: {
  label: string; file: File | null; existingUrl?: string | null;
  onChange: (f: File | null) => void; hasImage?: boolean; bgType?: "license" | "cin";
  tapReplaceText?: string; formatsText?: string;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <motion.label
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 h-40 overflow-hidden
        ${dragging
          ? "border-[#395886] dark:border-[#f39c12] bg-[#eef2fb] dark:bg-[#1e293b]/60 shadow-inner"
          : "border-[#D5DEEF]/70 dark:border-[#1e293b]/70 bg-white/50 dark:bg-[#0f1729]/40 hover:border-[#638ECB]/50 dark:hover:border-[#638ECB]/40 hover:bg-[#F0F3FA]/80 dark:hover:bg-[#1e293b]/50 hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onChange(f); }}
    >
      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      {existingUrl && hasImage ? (
        <>
          <img src={existingUrl} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-30 dark:opacity-20" />
          <div className="relative z-10 flex flex-col items-center gap-1.5 bg-white/60 dark:bg-[#0f1729]/70 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#638ECB] to-[#395886] dark:from-[#f39c12] dark:to-[#d68910] flex items-center justify-center shadow-md">
              <Upload className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-extrabold text-[#395886] dark:text-[#D5DEEF]">{label}</span>
            <span className="text-[10px] font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]">{tapReplaceText}</span>
          </div>
        </>
      ) : file ? (
        <div className="flex flex-col items-center gap-1.5 bg-white/60 dark:bg-[#0f1729]/70 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
          <CheckCircle className="w-7 h-7 text-emerald-500" />
          <span className="text-xs font-bold text-gray-700 dark:text-[#D5DEEF] text-center px-2 truncate max-w-[140px]">{file.name}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D5DEEF] to-[#bccbe0] dark:from-[#1e293b] dark:to-[#334155] flex items-center justify-center shadow-inner">
            <Upload className="w-5 h-5 text-[#395886] dark:text-[#94A3B8]" />
          </div>
          <span className="text-xs font-extrabold text-[#395886] dark:text-[#D5DEEF]">{label}</span>
          <span className="text-[10px] font-semibold text-[#638ECB]/60 dark:text-[#64748b]">{formatsText}</span>
        </div>
      )}
    </motion.label>
  );
}

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
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ShimmerButton({ children, ...props }: React.ComponentProps<typeof motion.button> & { children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
      className={`relative overflow-hidden group ${props.className || ""}`}
    >
      <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,transparent,rgba(255,255,255,0.15),transparent,transparent)] dark:bg-[linear-gradient(110deg,transparent,transparent,rgba(255,255,255,0.08),transparent,transparent)] bg-[length:200%_100%] group-hover:animate-[shimmer_2.5s_infinite]" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

function InputField({ icon: Icon, label, error, ...props }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[11px] font-extrabold text-[#638ECB] dark:text-[#94A3B8] uppercase tracking-[0.12em] flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </label>
      <input
        {...props}
        className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 outline-none
          ${props.disabled
            ? "border-[#D5DEEF]/60 dark:border-[#1e293b]/60 bg-gray-50/50 dark:bg-[#1e293b]/30 text-[#638ECB]/60 dark:text-[#64748b] cursor-not-allowed"
            : "border-[#D5DEEF]/60 dark:border-[#1e293b]/70 bg-white/80 dark:bg-[#1e293b]/60 text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 dark:placeholder:text-[#64748b]/50 focus:border-[#638ECB]/50 dark:focus:border-[#638ECB]/40 focus:ring-4 focus:ring-[#638ECB]/10 dark:focus:ring-[#638ECB]/5 hover:border-[#638ECB]/30 dark:hover:border-[#638ECB]/20"
          } ${props.className || ""}`}
      />
      {error && <p className="text-[11px] font-semibold text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

function StatusBadge({ verified }: { verified: boolean }) {
  const { t } = useI18n();
  return verified ? (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-full px-4 py-2 shadow-sm">
      <CheckCircle className="w-3.5 h-3.5" /> {t("profile.all_verified")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 rounded-full px-4 py-2 shadow-sm">
      <Fingerprint className="w-3.5 h-3.5" /> {t("profile.pending")}
    </span>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-[#D5DEEF]/50 dark:border-[#1e293b]/70 bg-white/70 dark:bg-[#0f1729]/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-xl dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, gradient, title, subtitle, right }: {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-7 py-5 border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/60 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center shadow-lg shadow-black/10`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-extrabold text-[#395886] dark:text-[#D5DEEF] text-sm">{title}</h2>
          <p className="text-[11px] font-semibold text-[#638ECB]/70 dark:text-[#94A3B8]/70">{subtitle}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6 },
  },
};

export default function ProfilePage({ hideBackButton }: { hideBackButton?: boolean }) {
  const { t, locale } = useI18n();
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale, { month: "short", day: "2-digit", year: "numeric" });
  };

  const toDateInputValue = (date: string | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const { user, refreshUser } = useAuth();

  const initial = useMemo(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    cin_passport: user?.cin_passport ?? "",
    date_of_birth: user?.date_of_birth ?? "",
    driver_license_number: user?.driver_license_number ?? "",
    license_issue_date: user?.license_issue_date ?? "",
    license_expiry_date: user?.license_expiry_date ?? "",
    profile_pic: user?.profile_pic ?? null,
    cin_recto: user?.cin_recto ?? null,
    cin_verso: user?.cin_verso ?? null,
    permi_recto: user?.permi_recto ?? null,
    permi_verso: user?.permi_verso ?? null,
  }), [user]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cinPassport, setCinPassport] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [licenseIssueDate, setLicenseIssueDate] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initial.name) {
      setName(initial.name);
      setEmail(initial.email);
      setPhone(initial.phone);
      setAddress(initial.address);
      setCinPassport(initial.cin_passport);
      setDateOfBirth(toDateInputValue(initial.date_of_birth));
      setDriverLicenseNumber(initial.driver_license_number);
      setLicenseIssueDate(toDateInputValue(initial.license_issue_date));
      setLicenseExpiryDate(toDateInputValue(initial.license_expiry_date));
      initialized.current = true;
    }
  }, [initial.name, initial.email, initial.phone, initial.address, initial.cin_passport, initial.date_of_birth, initial.driver_license_number, initial.license_issue_date, initial.license_expiry_date]);

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

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);

  useEffect(() => {
    getMyReservations()
      .then(setReservations)
      .catch(() => {})
      .finally(() => setReservationsLoading(false));
  }, []);

  async function onUpdateBasic(e: React.FormEvent) {
    e.preventDefault();
    setBasicSubmitting(true);
    setBasicError(null);
    setBasicSuccess(null);
    try {
      await updateProfileName(name.trim());
      await updateProfileDetails({
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        cin_passport: cinPassport.trim() || undefined,
        date_of_birth: dateOfBirth || undefined,
        driver_license_number: driverLicenseNumber.trim() || undefined,
        license_issue_date: licenseIssueDate || undefined,
        license_expiry_date: licenseExpiryDate || undefined,
      });
      if (profilePicFile) {
        await updateProfilePicture(profilePicFile);
      }
      setBasicSuccess(t("profile.update_success"));
      setProfilePicFile(null);
      await refreshUser();
    } catch (err) {
      setBasicError((err as ApiError)?.message ?? t("profile.update_error"));
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
    if (!permiRectoFile || !permiVersoFile) { setDocsError(t("profile.license_validation")); return; }
    setDocsSubmitting(true); setDocsError(null); setDocsSuccess(null);
    try {
      await addPermi(permiRectoFile, permiVersoFile);
      setDocsSuccess(t("profile.license_success"));
      setPermiRectoFile(null); setPermiVersoFile(null);
      await refreshUser();
    } catch (err) {
      setDocsError((err as ApiError)?.message ?? t("profile.upload_error"));
    } finally { setDocsSubmitting(false); }
  }

  async function onUploadCin(e: React.FormEvent) {
    e.preventDefault();
    if (!cinRectoFile || !cinVersoFile) { setDocsError(t("profile.cin_validation")); return; }
    setDocsSubmitting(true); setDocsError(null); setDocsSuccess(null);
    try {
      await addCin(cinRectoFile, cinVersoFile);
      setDocsSuccess(t("profile.cin_success"));
      setCinRectoFile(null); setCinVersoFile(null);
      await refreshUser();
    } catch (err) {
      setDocsError((err as ApiError)?.message ?? t("profile.upload_error"));
    } finally { setDocsSubmitting(false); }
  }

  const profilePicSrc = initial.profile_pic ? profileImageUrl(initial.profile_pic) : null;
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "?";

  const docsComplete = !!(initial.cin_recto && initial.cin_verso && initial.permi_recto && initial.permi_verso);

  const searchParams = useSearchParams();
  const uploadPrompt = searchParams.get("upload");

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#F0F3FA] dark:bg-[#070b14] transition-colors duration-500">
        {uploadPrompt === "documents" && (
          <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800/50 px-6 py-4 text-center">
            <p className="text-amber-800 dark:text-amber-300 font-bold text-sm">
              {t("profile.documents_banner")}
            </p>
          </div>
        )}

        {/* ── Hero ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] via-[#2b4c7e] to-[#1d3560]">
          <Particles />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#638ECB]/10 blur-3xl -translate-x-1/4 translate-y-1/3" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative max-w-4xl mx-auto px-6 py-14">
            {!hideBackButton && <BackButton />}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-6"
            >
              <div className="relative shrink-0 group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-2xl bg-gradient-to-br from-[#638ECB] to-[#395886] transition-transform duration-300 group-hover:scale-[1.03]">
                  {profilePicSrc ? (
                    <img src={profilePicSrc} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-black text-white">{userInitial}</span>
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-[#f39c12] to-[#e08e0b] flex items-center justify-center cursor-pointer shadow-lg shadow-[#f39c12]/30 hover:scale-110 hover:rotate-12 transition-all duration-300 border-2 border-white dark:border-[#0f1729]">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfilePicFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#f39c12]" />
                  <span className="text-white/60 text-xs font-bold uppercase tracking-[0.15em]">{t("profile.your_profile")}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight truncate">{initial.name || t("profile.welcome")}</h1>
                <p className="text-white/60 text-sm font-semibold mt-1">{initial.email}</p>
                {profilePicFile && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block mt-2 text-[10px] font-extrabold text-[#f39c12] bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full"
                  >
                    {t("profile.photo_hint")}
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent via-[#F0F3FA]/20 to-[#F0F3FA] dark:via-[#070b14]/20 dark:to-[#070b14] pointer-events-none" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto px-6 mt-8 relative z-10 pb-16 flex flex-col gap-7"
        >
          {/* ── Personal Details ── */}
          <motion.div variants={cardVariants}>
            <SectionCard>
              <SectionHeader
                icon={User}
                gradient="bg-gradient-to-br from-[#638ECB] to-[#395886]"
                title={t("profile.personal_info")}
                subtitle={t("profile.personal_subtitle")}
              />
              <form onSubmit={onUpdateBasic} className="px-7 py-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 flex flex-col gap-5">
                    <InputField
                      icon={User}
                      label={t("profile.name_label")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("profile.name_placeholder")}
                      type="text"
                    />
                    <InputField
                      icon={Mail}
                      label={t("profile.email_label")}
                      value={email}
                      disabled
                      type="email"
                    />
                    <p className="text-[11px] font-semibold text-[#638ECB]/50 dark:text-[#94A3B8]/50 -mt-3">{t("profile.email_change_hint")}</p>
                    <InputField
                      icon={Smartphone}
                      label={t("profile.phone_label")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("profile.phone_placeholder")}
                      type="tel"
                    />
                    <InputField
                      icon={MapPin}
                      label={t("profile.address_label")}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t("profile.address_placeholder")}
                      type="text"
                    />
                    <InputField
                      icon={IdCard}
                      label={t("profile.cin_passport_label")}
                      value={cinPassport}
                      onChange={(e) => setCinPassport(e.target.value)}
                      placeholder={t("profile.cin_passport_placeholder")}
                      type="text"
                    />
                    <InputField
                      icon={Calendar}
                      label={t("profile.date_of_birth_label")}
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      type="date"
                    />
                    <InputField
                      icon={IdCard}
                      label={t("profile.driver_license_label")}
                      value={driverLicenseNumber}
                      onChange={(e) => setDriverLicenseNumber(e.target.value)}
                      placeholder={t("profile.driver_license_placeholder")}
                      type="text"
                    />
                    <InputField
                      icon={Calendar}
                      label={t("profile.license_issue_date_label")}
                      value={licenseIssueDate}
                      onChange={(e) => setLicenseIssueDate(e.target.value)}
                      type="date"
                    />
                    <InputField
                      icon={Calendar}
                      label={t("profile.license_expiry_date_label")}
                      value={licenseExpiryDate}
                      onChange={(e) => setLicenseExpiryDate(e.target.value)}
                      type="date"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {basicError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                      <div className="text-sm text-rose-700 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 rounded-xl px-4 py-3 font-bold">{basicError}</div>
                    </motion.div>
                  )}
                  {basicSuccess && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                      <div className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> {basicSuccess}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end mt-6">
                  <ShimmerButton
                    type="submit" disabled={basicSubmitting}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] dark:from-[#f39c12] dark:to-[#d68910] text-white dark:text-[#0f1729] text-sm font-extrabold shadow-lg shadow-[#395886]/20 dark:shadow-[#f39c12]/20 hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {basicSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white dark:border-[#0f1729] border-t-transparent rounded-full animate-spin" />
                        {t("profile.saving")}
                      </span>
                    ) : t("profile.save")}
                  </ShimmerButton>
                </div>
              </form>
            </SectionCard>
          </motion.div>

          {/* ── Security ── */}
          <motion.div variants={cardVariants}>
            <SectionCard>
              <SectionHeader
                icon={Shield}
                gradient="bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700"
                title={t("profile.security")}
                subtitle={t("profile.security_subtitle")}
              />
              <form onSubmit={onUpdatePassword} className="px-7 py-6 flex flex-col gap-5">
                <div className="grid sm:grid-cols-3 gap-4">
                  <InputField
                    icon={Lock}
                    label={t("profile.password_current")}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t("profile.password_placeholder")}
                    type={showPw ? "text" : "password"}
                  />
                  <InputField
                    icon={Lock}
                    label={t("profile.password_new")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("profile.password_placeholder")}
                    type={showPw ? "text" : "password"}
                  />
                  <InputField
                    icon={Lock}
                    label={t("profile.password_confirm")}
                    value={confirmePassword}
                    onChange={(e) => setConfirmePassword(e.target.value)}
                    placeholder={t("profile.password_placeholder")}
                    type={showPw ? "text" : "password"}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#638ECB] dark:text-[#94A3B8] hover:text-[#395886] dark:hover:text-[#D5DEEF] transition-colors">
                  <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)}
                    className="w-4 h-4 accent-[#638ECB] dark:accent-[#f39c12] rounded" />
                  <Eye className="w-3.5 h-3.5" /> {t("profile.show_passwords")}
                </label>

                <AnimatePresence>
                  {pwError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="text-sm text-rose-700 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 rounded-xl px-4 py-3 font-bold">{pwError}</div>
                    </motion.div>
                  )}
                  {pwSuccess && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> {pwSuccess}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end">
                  <ShimmerButton
                    type="submit" disabled={pwSubmitting}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white text-sm font-extrabold shadow-lg shadow-amber-500/20 hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {pwSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("profile.updating")}
                      </span>
                    ) : t("profile.update_button")}
                  </ShimmerButton>
                </div>
              </form>
            </SectionCard>
          </motion.div>

          {/* ── Documents ── */}
          {user?.role_id !== 1 && <motion.div variants={cardVariants}>
            <SectionCard>
              <SectionHeader
                icon={IdCard}
                gradient="bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700"
                title={t("profile.documents")}
                subtitle={t("profile.documents_subtitle")}
                right={<StatusBadge verified={docsComplete} />}
              />

              <div className="px-7 py-6 flex flex-col gap-8">
                <AnimatePresence>
                  {docsError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="text-sm text-rose-700 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 rounded-xl px-4 py-3 font-bold">{docsError}</div>
                    </motion.div>
                  )}
                  {docsSuccess && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <div className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl px-4 py-3 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> {docsSuccess}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Driver's License */}
                <form onSubmit={onUploadPermi}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${initial.permi_recto && initial.permi_verso ? "bg-emerald-100 dark:bg-emerald-950/50" : "bg-[#F0F3FA] dark:bg-[#1e293b]/60"}`}>
                        <FileText className={`w-4 h-4 ${initial.permi_recto && initial.permi_verso ? "text-emerald-600 dark:text-emerald-400" : "text-[#638ECB] dark:text-[#94A3B8]"}`} />
                      </div>
                      <span className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF]">{t("profile.license_section")}</span>
                      {initial.permi_recto && initial.permi_verso && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <UploadZone label={t("profile.front_label")} file={permiRectoFile}
                      existingUrl={initial.permi_recto ? vehicleImageUrl(initial.permi_recto) : null}
                      onChange={setPermiRectoFile} hasImage={!!initial.permi_recto} bgType="license"
                      tapReplaceText={t("profile.upload_tap_replace")} formatsText={t("profile.upload_formats")} />
                    <UploadZone label={t("profile.back_label")} file={permiVersoFile}
                      existingUrl={initial.permi_verso ? vehicleImageUrl(initial.permi_verso) : null}
                      onChange={setPermiVersoFile} hasImage={!!initial.permi_verso} bgType="license"
                      tapReplaceText={t("profile.upload_tap_replace")} formatsText={t("profile.upload_formats")} />
                  </div>
                  <div className="flex justify-end">
                    <ShimmerButton
                      type="submit" disabled={docsSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] dark:from-[#f39c12] dark:to-[#d68910] text-white dark:text-[#0f1729] text-xs font-extrabold shadow-lg shadow-[#395886]/20 dark:shadow-[#f39c12]/20 hover:shadow-xl disabled:opacity-50 transition-all"
                    >
                      {docsSubmitting ? t("profile.uploading") : t("profile.upload_license_button")}
                    </ShimmerButton>
                  </div>
                </form>

                <div className="border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/60" />

                {/* CIN / Passport */}
                <form onSubmit={onUploadCin}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${initial.cin_recto && initial.cin_verso ? "bg-emerald-100 dark:bg-emerald-950/50" : "bg-[#F0F3FA] dark:bg-[#1e293b]/60"}`}>
                        <IdCard className={`w-4 h-4 ${initial.cin_recto && initial.cin_verso ? "text-emerald-600 dark:text-emerald-400" : "text-[#638ECB] dark:text-[#94A3B8]"}`} />
                      </div>
                      <span className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF]">{t("profile.cin_section")}</span>
                      {initial.cin_recto && initial.cin_verso && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <UploadZone label={t("profile.front_label")} file={cinRectoFile}
                      existingUrl={initial.cin_recto ? vehicleImageUrl(initial.cin_recto) : null}
                      onChange={setCinRectoFile} hasImage={!!initial.cin_recto} bgType="cin"
                      tapReplaceText={t("profile.upload_tap_replace")} formatsText={t("profile.upload_formats")} />
                    <UploadZone label={t("profile.back_label")} file={cinVersoFile}
                      existingUrl={initial.cin_verso ? vehicleImageUrl(initial.cin_verso) : null}
                      onChange={setCinVersoFile} hasImage={!!initial.cin_verso} bgType="cin"
                      tapReplaceText={t("profile.upload_tap_replace")} formatsText={t("profile.upload_formats")} />
                  </div>
                  <div className="flex justify-end">
                    <ShimmerButton
                      type="submit" disabled={docsSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] dark:from-[#f39c12] dark:to-[#d68910] text-white dark:text-[#0f1729] text-xs font-extrabold shadow-lg shadow-[#395886]/20 dark:shadow-[#f39c12]/20 hover:shadow-xl disabled:opacity-50 transition-all"
                    >
                      {docsSubmitting ? t("profile.uploading") : t("profile.upload_cin_button")}
                    </ShimmerButton>
                  </div>
                </form>
              </div>
            </SectionCard>
          </motion.div>}

          {/* ── My Reservations ── */}
          <motion.div variants={cardVariants}>
            <SectionCard>
              <SectionHeader
                icon={Calendar}
                gradient="bg-gradient-to-br from-[#f39c12] to-[#e08e0b]"
                title={t("profile.my_reservations") || "My Reservations"}
                subtitle={t("profile.reservations_subtitle") || "Your rental history"}
              />
              <div className="px-7 py-6">
                {reservationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#f39c12] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : reservations.length === 0 ? (
                  <p className="text-sm font-bold text-[#638ECB]/50 dark:text-[#94A3B8]/50 text-center py-8">
                    {t("profile.no_reservations") || "No reservations yet"}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reservations.slice(0, 5).map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-[#F0F3FA]/70 dark:bg-[#1e293b]/40 border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 hover:border-[#f39c12]/30 dark:hover:border-[#f39c12]/20 transition-all"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#D5DEEF]/60 dark:bg-[#1e293b]/70 flex items-center justify-center shrink-0">
                          <Car className="w-6 h-6 text-[#395886] dark:text-[#94A3B8]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold text-[#395886] dark:text-[#D5DEEF] truncate">
                            {res.vehicle
                              ? `${res.vehicle.marque || ""} ${res.vehicle.model || ""}`.trim() || `#${res.id}`
                              : `#${res.id}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-[#638ECB] dark:text-[#94A3B8]" />
                            <span className="text-xs font-bold text-[#638ECB] dark:text-[#94A3B8]">
                              {formatDate(res.start_date)}
                            </span>
                            <ArrowRight className="w-3 h-3 text-[#638ECB]/40 dark:text-[#94A3B8]/40" />
                            <Calendar className="w-3 h-3 text-[#638ECB] dark:text-[#94A3B8]" />
                            <span className="text-xs font-bold text-[#638ECB] dark:text-[#94A3B8]">
                              {formatDate(res.end_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                              res.status === "Confirmée" || res.status === "confirmed"
                                ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                : res.status === "En_Attente" || res.status === "pending"
                                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                                : res.status === "Terminée" || res.status === "completed"
                                ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                                : "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                            }`}>
                              {res.status}
                            </span>
                            <span className="text-[11px] font-extrabold text-[#395886] dark:text-[#D5DEEF]">
                              {Number(res.TotalPrice).toLocaleString(locale)} DH
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>
          </motion.div>
        </motion.div>
      </div>
    </RequireAuth>
  );
}
