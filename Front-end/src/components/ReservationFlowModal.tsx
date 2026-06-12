"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { addCin, addPermi } from "@/lib/profileApi";
import { makeReservation } from "@/lib/reservationsApi";
import { getExtras } from "@/lib/extrasApi";
import { getClientInfo, saveClientInfo } from "@/lib/clientApi";
import type { Extra } from "@/lib/types";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Upload, CheckCircle, X, User, Users, FileText, IdCard, Package, Shield, ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type FieldErrors = Record<string, string>;

type Choice = "one" | "two" | null;

type Props = {
  vehicleId: number;
  vehicleName: string;
  startDate: string;
  endDate: string;
  defaultChoice?: Choice;
  onClose: (choice?: Choice) => void;
  onSuccess: () => void;
};

type Step =
  | "choose"
  | "oneDriverUpload"
  | "twoDrivers"
  | "extras"
  | "clientInfo"
  | "secondDriverInfo"
  | "caution"
  | "reserving"
  | "reservationError"
  | "done";

function FileUpload({
  label,
  file,
  setFile,
  inputRef,
  existingUrl,
}: {
  label: string;
  file: File | null;
  setFile: (f: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  existingUrl?: string | null;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[11px] font-bold text-[#395886] uppercase tracking-wider">{label}</div>
      {existingUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-green-200 bg-green-50 p-2">
          <img src={existingUrl} alt={label} className="h-20 w-full object-cover rounded" />
          <div className="absolute top-1 right-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" /> Déjà uploadé
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[#D5DEEF] rounded-lg p-3 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#638ECB] transition-colors min-h-[60px]"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-16 w-full object-cover rounded" />
          ) : (
            <>
              <Upload className="w-4 h-4 text-[#638ECB]" />
              <span className="text-[10px] text-[#638ECB] font-semibold">Cliquez pour uploader</span>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder, required, error }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-[#638ECB] uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-white h-10 px-3 text-[13px] text-[#395886] focus:outline-none focus:ring-2 transition-all ${
          error
            ? "border-rose-300 focus:ring-rose-300/40"
            : "border-[#D5DEEF] focus:ring-[#638ECB]/40"
        }`}
        placeholder={placeholder}
        required={required}
      />
      {error && (
        <p className="text-[10px] font-semibold text-rose-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}

function PhoneInputField({ value, onChange, error, label }: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-[#638ECB] uppercase tracking-wider">
        {label}<span className="text-rose-500 ml-0.5">*</span>
      </label>
      <PhoneInput
        international
        defaultCountry="MA"
        value={value as any}
        onChange={(v) => onChange(v ?? "")}
        className={`w-full rounded-lg border bg-white h-10 px-3 text-[13px] text-[#395886] focus-within:outline-none focus-within:ring-2 transition-all ${
          error
            ? "border-rose-300 focus-within:ring-rose-300/40"
            : "border-[#D5DEEF] focus-within:ring-[#638ECB]/40"
        }`}
      />
      {error && (
        <p className="text-[10px] font-semibold text-rose-500 mt-0.5">{error}</p>
      )}
    </div>
  );
}

export default function ReservationFlowModal({
  vehicleId,
  vehicleName,
  startDate,
  endDate,
  defaultChoice,
  onClose,
  onSuccess,
}: Props) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();

  const [savedChoice, setSavedChoice] = useState<Choice>(defaultChoice ?? null);
  const [step, setStep] = useState<Step>(defaultChoice ? (defaultChoice === "one" ? "oneDriverUpload" : "twoDrivers") : "choose");
  const [error, setError] = useState<string | null>(null);

  const userHasCin = !!(user?.cin_recto && user?.cin_verso);
  const userHasPermi = !!(user?.permi_recto && user?.permi_verso);

  const [driver2Name, setDriver2Name] = useState("");

  const [cinRecto, setCinRecto] = useState<File | null>(null);
  const [cinVerso, setCinVerso] = useState<File | null>(null);
  const [permiRecto, setPermiRecto] = useState<File | null>(null);
  const [permiVerso, setPermiVerso] = useState<File | null>(null);

  const [d2CinRecto, setD2CinRecto] = useState<File | null>(null);
  const [d2CinVerso, setD2CinVerso] = useState<File | null>(null);
  const [d2PermiRecto, setD2PermiRecto] = useState<File | null>(null);
  const [d2PermiVerso, setD2PermiVerso] = useState<File | null>(null);

  const cinRectoRef = useRef<HTMLInputElement>(null);
  const cinVersoRef = useRef<HTMLInputElement>(null);
  const permiRectoRef = useRef<HTMLInputElement>(null);
  const permiVersoRef = useRef<HTMLInputElement>(null);
  const d2CinRectoRef = useRef<HTMLInputElement>(null);
  const d2CinVersoRef = useRef<HTMLInputElement>(null);
  const d2PermiRectoRef = useRef<HTMLInputElement>(null);
  const d2PermiVersoRef = useRef<HTMLInputElement>(null);

  const [extras, setExtras] = useState<Extra[]>([]);
  const [selectedExtraIds, setSelectedExtraIds] = useState<number[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Client info
  const [existingClient, setExistingClient] = useState<boolean | null>(null);
  const [checkingClient, setCheckingClient] = useState(false);
  const [clientNom, setClientNom] = useState("");
  const [clientDateNaissance, setClientDateNaissance] = useState("");
  const [clientCin, setClientCin] = useState("");
  const [clientAdresse, setClientAdresse] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  const [clientNumeroPermi, setClientNumeroPermi] = useState("");
  const [clientDateDelivrance, setClientDateDelivrance] = useState("");
  const [clientDateExpiration, setClientDateExpiration] = useState("");

  // Second driver full info
  const [sdNom, setSdNom] = useState("");
  const [sdDateNaissance, setSdDateNaissance] = useState("");
  const [sdCin, setSdCin] = useState("");
  const [sdAdresse, setSdAdresse] = useState("");
  const [sdTelephone, setSdTelephone] = useState("");
  const [sdNumeroPermi, setSdNumeroPermi] = useState("");
  const [sdDateDelivrance, setSdDateDelivrance] = useState("");
  const [sdDateExpiration, setSdDateExpiration] = useState("");

  // Caution
  const [cautionMontant, setCautionMontant] = useState("");
  const [cautionMode, setCautionMode] = useState("");

  // Validation errors (real-time)
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [sdErrors, setSdErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateClientField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "nom":
        if (!value.trim()) return "Le nom et prénom est requis";
        if (value.trim().length < 3) return "Minimum 3 caractères";
        return "";
      case "dateNaissance":
        if (!value) return "La date de naissance est requise";
        if (new Date(value) >= new Date()) return "Doit être dans le passé";
        return "";
      case "cin":
        if (!value.trim()) return "Le N° CIN / Passeport est requis";
        if (value.trim().length < 4) return "Minimum 4 caractères";
        return "";
      case "adresse":
        if (!value.trim()) return "L'adresse est requise";
        if (value.trim().length < 5) return "Minimum 5 caractères";
        return "";
      case "telephone":
        if (!value) return "Le téléphone est requis";
        if (!value.startsWith("+") || value.length < 8) return "Numéro de téléphone invalide";
        return "";
      case "numeroPermi":
        if (!value.trim()) return "Le N° de permis est requis";
        if (value.trim().length < 3) return "Minimum 3 caractères";
        return "";
      case "dateDelivrance":
        if (!value) return "La date de délivrance est requise";
        return "";
      case "dateExpiration":
        if (!value) return "La date d'expiration est requise";
        if (clientDateDelivrance && value <= clientDateDelivrance) return "Doit être après la date de délivrance";
        return "";
      default:
        return "";
    }
  }, [clientDateDelivrance]);

  const validateSdField = useCallback((field: string, value: string): string => {
    // If all fields are empty, no error — it's optional
    const allEmpty = [sdNom, sdDateNaissance, sdCin, sdAdresse, sdTelephone, sdNumeroPermi, sdDateDelivrance, sdDateExpiration]
      .every((f) => !f.trim());
    if (allEmpty) return "";

    switch (field) {
      case "nom":
        if (!value.trim()) return "Requis si le second conducteur est renseigné";
        if (value.trim().length < 3) return "Minimum 3 caractères";
        return "";
      case "dateNaissance":
        if (!value) return "Requis";
        if (new Date(value) >= new Date()) return "Doit être dans le passé";
        return "";
      case "cin":
        if (!value.trim()) return "Requis";
        if (value.trim().length < 4) return "Minimum 4 caractères";
        return "";
      case "adresse":
        if (!value.trim()) return "Requis";
        if (value.trim().length < 5) return "Minimum 5 caractères";
        return "";
      case "telephone":
        if (!value) return "Requis";
        if (!value.startsWith("+") || value.length < 8) return "Numéro de téléphone invalide";
        return "";
      case "numeroPermi":
        if (!value.trim()) return "Requis";
        if (value.trim().length < 3) return "Minimum 3 caractères";
        return "";
      case "dateDelivrance":
        if (!value) return "Requis";
        return "";
      case "dateExpiration":
        if (!value) return "Requis";
        if (sdDateDelivrance && value <= sdDateDelivrance) return "Doit être après la date de délivrance";
        return "";
      default:
        return "";
    }
  }, [sdNom, sdDateNaissance, sdCin, sdAdresse, sdTelephone, sdNumeroPermi, sdDateDelivrance, sdDateExpiration]);

  const isClientInfoValid = useCallback((): boolean => {
    const fields: [string, string][] = [
      ["nom", clientNom], ["dateNaissance", clientDateNaissance], ["cin", clientCin],
      ["adresse", clientAdresse], ["telephone", clientTelephone], ["numeroPermi", clientNumeroPermi],
      ["dateDelivrance", clientDateDelivrance], ["dateExpiration", clientDateExpiration],
    ];
    return fields.every(([k, v]) => !validateClientField(k, v));
  }, [clientNom, clientDateNaissance, clientCin, clientAdresse, clientTelephone, clientNumeroPermi, clientDateDelivrance, clientDateExpiration, validateClientField]);

  const isSdInfoValid = useCallback((): boolean => {
    const allEmpty = [sdNom, sdDateNaissance, sdCin, sdAdresse, sdTelephone, sdNumeroPermi, sdDateDelivrance, sdDateExpiration]
      .every((f) => !f.trim());
    if (allEmpty) return true;
    const fields: [string, string][] = [
      ["nom", sdNom], ["dateNaissance", sdDateNaissance], ["cin", sdCin],
      ["adresse", sdAdresse], ["telephone", sdTelephone], ["numeroPermi", sdNumeroPermi],
      ["dateDelivrance", sdDateDelivrance], ["dateExpiration", sdDateExpiration],
    ];
    return fields.every(([k, v]) => !validateSdField(k, v));
  }, [sdNom, sdDateNaissance, sdCin, sdAdresse, sdTelephone, sdNumeroPermi, sdDateDelivrance, sdDateExpiration, validateSdField]);

  function handleClientChange(field: string, value: string, setter: (v: string) => void) {
    setter(value);
    setTouched((prev) => ({ ...prev, ["client_" + field]: true }));
    setClientErrors((prev) => {
      const err = validateClientField(field, value);
      if (err) return { ...prev, [field]: err };
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSdChange(field: string, value: string, setter: (v: string) => void) {
    setter(value);
    setTouched((prev) => ({ ...prev, ["sd_" + field]: true }));
    setSdErrors((prev) => {
      const err = validateSdField(field, value);
      if (err) return { ...prev, [field]: err };
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  useEffect(() => {
    getExtras().then(setExtras).catch(() => {});
  }, []);

  useEffect(() => {
    if (step === "extras") {
      checkClientInfo();
    }
  }, [step]);

  async function checkClientInfo() {
    setCheckingClient(true);
    try {
      const client = await getClientInfo();
      if (client) {
        setExistingClient(true);
        setClientNom(client.nom_prenom);
        setClientDateNaissance(client.date_naissance);
        setClientCin(client.cin_passport);
        setClientAdresse(client.adresse);
        setClientTelephone(client.telephone);
        setClientNumeroPermi(client.numero_permi);
        setClientDateDelivrance(client.date_delivrance);
        setClientDateExpiration(client.date_expiration);
      } else {
        setExistingClient(false);
      }
    } catch {
      setExistingClient(false);
    } finally {
      setCheckingClient(false);
    }
  }

  const extrasTotalPerDay = extras
    .filter((e) => selectedExtraIds.includes(e.id))
    .reduce((sum, e) => sum + e.price_per_day, 0);

  function toggleExtra(extraId: number) {
    setSelectedExtraIds((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId]
    );
  }

  async function handleChooseOneDriver() {
    setSavedChoice("one");
    if (userHasCin && userHasPermi) {
      setStep("extras");
    } else {
      setStep("oneDriverUpload");
    }
  }

  async function proceedFromUploads() {
    setStep("extras");
  }

  async function handleUploadAndReserve() {
    setError(null);
    try {
      if (!userHasCin && (!cinRecto || !cinVerso)) {
        throw new Error("Veuillez sélectionner votre CIN (recto et verso).");
      }
      if (!userHasPermi && (!permiRecto || !permiVerso)) {
        throw new Error("Veuillez sélectionner votre permis (recto et verso).");
      }

      if (cinRecto && cinVerso) {
        await addCin(cinRecto, cinVerso);
      }
      if (permiRecto && permiVerso) {
        await addPermi(permiRecto, permiVerso);
      }

      await refreshUser();
      setStep("extras");
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l'envoi des documents.");
      setStep("oneDriverUpload");
    }
  }

  async function handleTwoDriversSubmit() {
    setError(null);
    if (!driver2Name.trim()) {
      setError("Veuillez entrer le nom du second conducteur.");
      return;
    }
    if (!d2CinRecto || !d2CinVerso) {
      setError("Veuillez sélectionner le CIN du second conducteur (recto et verso).");
      return;
    }
    if (!d2PermiRecto || !d2PermiVerso) {
      setError("Veuillez sélectionner le permis du second conducteur (recto et verso).");
      return;
    }

    try {
      if (cinRecto && cinVerso) {
        await addCin(cinRecto, cinVerso);
      }
      if (permiRecto && permiVerso) {
        await addPermi(permiRecto, permiVerso);
      }

      await refreshUser();
      setStep("extras");
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la réservation.");
      setStep("twoDrivers");
    }
  }

  function handleExtrasNext() {
    if (existingClient) {
      // Already has client info, skip to second driver or caution
      if (savedChoice === "two") {
        setStep("secondDriverInfo");
      } else {
        setStep("caution");
      }
    } else {
      setStep("clientInfo");
    }
  }

  function handleClientInfoNext() {
    if (savedChoice === "two") {
      setStep("secondDriverInfo");
    } else {
      setStep("caution");
    }
  }

  function handleSecondDriverNext() {
    setStep("caution");
  }

  function validateSecondDriver(): boolean {
    const fields = [sdNom, sdDateNaissance, sdCin, sdAdresse, sdTelephone, sdNumeroPermi, sdDateDelivrance, sdDateExpiration];
    const filled = fields.filter((f) => f.trim().length > 0).length;
    if (filled > 0 && filled < fields.length) {
      setError("Veuillez remplir tous les champs du second conducteur ou les laisser tous vides.");
      return false;
    }
    return true;
  }

  async function handleProceedToReservation() {
    setError(null);

    // Validate second driver if 2 drivers
    if (savedChoice === "two") {
      if (!validateSecondDriver()) return;
    }

    setStep("reserving");

    const extra: Record<string, any> = {};

    // Client info
    if (!existingClient) {
      extra.nom_prenom = clientNom.trim();
      extra.date_naissance = clientDateNaissance;
      extra.cin_passport = clientCin.trim();
      extra.adresse = clientAdresse.trim();
      extra.telephone = clientTelephone.trim();
      extra.numero_permi = clientNumeroPermi.trim();
      extra.date_delivrance = clientDateDelivrance;
      extra.date_expiration = clientDateExpiration;
    }

    // Second conductor full info
    if (savedChoice === "two") {
      extra.driver2_name = driver2Name.trim();
      extra.driver2_cin_recto = d2CinRecto;
      extra.driver2_cin_verso = d2CinVerso;
      extra.driver2_permi_recto = d2PermiRecto;
      extra.driver2_permi_verso = d2PermiVerso;

      if (sdNom.trim()) {
        extra.driver2_nom_prenom = sdNom.trim();
        extra.driver2_date_naissance = sdDateNaissance;
        extra.driver2_cin_passport = sdCin.trim();
        extra.driver2_adresse = sdAdresse.trim();
        extra.driver2_telephone = sdTelephone.trim();
        extra.driver2_numero_permi = sdNumeroPermi.trim();
        extra.driver2_date_delivrance = sdDateDelivrance;
        extra.driver2_date_expiration = sdDateExpiration;
      }
    }

    // Caution
    if (cautionMontant.trim()) {
      extra.caution_montant = parseFloat(cautionMontant);
    }
    if (cautionMode) {
      extra.caution_mode = cautionMode;
    }

    const formData = new FormData();
    formData.set("start_date", startDate);
    formData.set("end_date", endDate);

    if (selectedExtraIds.length > 0) {
      for (const id of selectedExtraIds) {
        formData.append("extra_ids[]", String(id));
      }
    }

    for (const [key, value] of Object.entries(extra)) {
      if (value instanceof File) {
        formData.set(key, value);
      } else if (value !== undefined && value !== null) {
        formData.set(key, String(value));
      }
    }

    try {
      await makeReservation(vehicleId, formData);
      setStep("done");
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la réservation.");
      setStep("reservationError");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-[#D5DEEF]/40 px-6 py-4 flex items-center justify-between z-10 rounded-t-[24px]">
          <div>
            <h2 className="text-lg font-extrabold text-[#395886]">{t("reserve_modal.title")}</h2>
            <p className="text-[11px] text-[#638ECB] font-semibold">{vehicleName}</p>
          </div>
          <button onClick={() => onClose(savedChoice)} className="w-8 h-8 rounded-full hover:bg-[#F0F3FA] flex items-center justify-center">
            <X className="w-4 h-4 text-[#638ECB]" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "choose" && (
              <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <p className="text-sm text-[#395886] font-semibold text-center mb-2">{t("reserve_modal.drivers_question")}</p>
                <button onClick={handleChooseOneDriver} className="w-full p-5 rounded-xl border-2 border-[#D5DEEF] hover:border-[#395886] hover:bg-[#F0F3FA] transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F0F3FA] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#395886]" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-[#395886] text-sm">{t("reserve_modal.one_driver")}</div>
                    <div className="text-[11px] text-[#638ECB] font-semibold">{t("reserve_modal.one_driver_desc")}</div>
                  </div>
                </button>
                <button onClick={() => { setSavedChoice("two"); setStep("twoDrivers"); }} className="w-full p-5 rounded-xl border-2 border-[#D5DEEF] hover:border-[#395886] hover:bg-[#F0F3FA] transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F0F3FA] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#395886]" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-[#395886] text-sm">{t("reserve_modal.two_drivers")}</div>
                    <div className="text-[11px] text-[#638ECB] font-semibold">{t("reserve_modal.two_drivers_desc")}</div>
                  </div>
                </button>
              </motion.div>
            )}

            {step === "oneDriverUpload" && (
              <motion.div key="oneDriver" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <p className="text-sm text-[#395886] font-semibold text-center">{t("reserve_modal.documents_required")}</p>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}
                {!userHasCin && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-[#395886]" />
                      <span className="text-[12px] font-bold text-[#395886]">{t("reserve_modal.cin")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FileUpload label={t("reserve_modal.front")} file={cinRecto} setFile={setCinRecto} inputRef={cinRectoRef} />
                      <FileUpload label={t("reserve_modal.back")} file={cinVerso} setFile={setCinVerso} inputRef={cinVersoRef} />
                    </div>
                  </div>
                )}
                {!userHasPermi && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#395886]" />
                      <span className="text-[12px] font-bold text-[#395886]">{t("reserve_modal.drivers_license")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FileUpload label={t("reserve_modal.front")} file={permiRecto} setFile={setPermiRecto} inputRef={permiRectoRef} />
                      <FileUpload label={t("reserve_modal.back")} file={permiVerso} setFile={setPermiVerso} inputRef={permiVersoRef} />
                    </div>
                  </div>
                )}
                <button onClick={handleUploadAndReserve} className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity">
                  {t("reserve_modal.upload_continue")}
                </button>
              </motion.div>
            )}

            {step === "twoDrivers" && (
              <motion.div key="twoDrivers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <p className="text-sm text-[#395886] font-semibold text-center">{t("reserve_modal.two_drivers_info")}</p>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-[#395886]" />
                    <span className="text-[12px] font-bold text-[#395886]">Vous ({user?.name})</span>
                    {(userHasCin && userHasPermi) && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Documents OK</span>}
                  </div>
                  {(!userHasCin || !userHasPermi) && (
                    <div className="ml-6 border-l-2 border-[#D5DEEF] pl-4 flex flex-col gap-3">
                      {!userHasCin && (
                        <div>
                          <span className="text-[10px] font-bold text-[#638ECB] uppercase">{t("reserve_modal.cin")}</span>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <FileUpload label={t("reserve_modal.front")} file={cinRecto} setFile={setCinRecto} inputRef={cinRectoRef} />
                            <FileUpload label={t("reserve_modal.back")} file={cinVerso} setFile={setCinVerso} inputRef={cinVersoRef} />
                          </div>
                        </div>
                      )}
                      {!userHasPermi && (
                        <div>
                          <span className="text-[10px] font-bold text-[#638ECB] uppercase">{t("reserve_modal.drivers_license")}</span>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <FileUpload label={t("reserve_modal.front")} file={permiRecto} setFile={setPermiRecto} inputRef={permiRectoRef} />
                            <FileUpload label={t("reserve_modal.back")} file={permiVerso} setFile={setPermiVerso} inputRef={permiVersoRef} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="border-t border-[#D5DEEF]/40 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#395886]" />
                    <span className="text-[12px] font-bold text-[#395886]">{t("reserve_modal.second_driver")}</span>
                  </div>
                  <div className="flex flex-col gap-3 ml-6 border-l-2 border-[#D5DEEF] pl-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#638ECB] uppercase block mb-1">{t("reserve_modal.full_name")}</label>
                      <input
                        type="text"
                        value={driver2Name}
                        onChange={(e) => setDriver2Name(e.target.value)}
                        className="w-full rounded-lg border border-[#D5DEEF] bg-white h-10 px-3 text-[13px] text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/40"
                        placeholder="Nom du second conducteur"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#638ECB] uppercase">{t("reserve_modal.cin")}</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <FileUpload label={t("reserve_modal.front")} file={d2CinRecto} setFile={setD2CinRecto} inputRef={d2CinRectoRef} />
                        <FileUpload label={t("reserve_modal.back")} file={d2CinVerso} setFile={setD2CinVerso} inputRef={d2CinVersoRef} />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#638ECB] uppercase">{t("reserve_modal.drivers_license")}</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <FileUpload label={t("reserve_modal.front")} file={d2PermiRecto} setFile={setD2PermiRecto} inputRef={d2PermiRectoRef} />
                        <FileUpload label={t("reserve_modal.back")} file={d2PermiVerso} setFile={setD2PermiVerso} inputRef={d2PermiVersoRef} />
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={handleTwoDriversSubmit} className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity mt-2">
                  {t("reserve_modal.confirm_extras")}
                </button>
              </motion.div>
            )}

            {step === "extras" && (
              <motion.div key="extras" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <div className="text-center">
                  <Package className="w-8 h-8 text-[#395886] mx-auto mb-2" />
                  <p className="text-sm text-[#395886] font-semibold">{t("reserve_modal.extras_title")}</p>
                </div>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}
                {extras.length === 0 ? (
                  <div className="text-center py-6 text-[#638ECB] font-semibold text-sm">{t("reserve_modal.extras_loading")}</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {extras.map((extra) => {
                      const selected = selectedExtraIds.includes(extra.id);
                      return (
                        <button
                          key={extra.id}
                          type="button"
                          onClick={() => toggleExtra(extra.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            selected ? "border-[#395886] bg-[#F0F3FA]" : "border-[#D5DEEF] hover:border-[#638ECB]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                              selected ? "bg-[#395886] border-[#395886]" : "border-[#D5DEEF]"
                            }`}>
                              {selected && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            {extra.image_url && (
                              <div onClick={() => setLightboxImage(extra.image_url!)} className="shrink-0 cursor-pointer">
                                <img src={extra.image_url} alt={extra.name} className="w-20 h-20 rounded-xl object-cover pointer-events-none" />
                              </div>
                            )}
                            <span className="font-bold text-[#395886] text-sm">{extra.name}</span>
                          </div>
                          <span className="font-extrabold text-[#395886] text-sm">{extra.price_per_day} DH / jour</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedExtraIds.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <span className="text-[13px] font-bold text-amber-800">+{extrasTotalPerDay} DH / jour pour les extras sélectionnés</span>
                  </div>
                )}
                <button
                  onClick={handleExtrasNext}
                  className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity mt-2"
                >
                  {t("reserve_modal.confirm_reserve")}
                </button>
              </motion.div>
            )}

            {step === "clientInfo" && (
              <motion.div key="clientInfo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <div className="text-center">
                  <User className="w-8 h-8 text-[#395886] mx-auto mb-2" />
                  <p className="text-sm text-[#395886] font-semibold">Informations du locataire</p>
                  <p className="text-[10px] text-[#638ECB] font-semibold">Remplissez ces informations pour votre première réservation</p>
                </div>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <InputField label="Nom et prénom" value={clientNom} onChange={(v) => handleClientChange("nom", v, setClientNom)} placeholder="Ex: Jean Dupont" required error={touched["client_nom"] ? clientErrors["nom"] : ""} />
                  </div>
                  <InputField label="Date de naissance" type="date" value={clientDateNaissance} onChange={(v) => handleClientChange("dateNaissance", v, setClientDateNaissance)} required error={touched["client_dateNaissance"] ? clientErrors["dateNaissance"] : ""} />
                  <InputField label="N° CIN / Passeport" value={clientCin} onChange={(v) => handleClientChange("cin", v, setClientCin)} placeholder="Ex: AB123456" required error={touched["client_cin"] ? clientErrors["cin"] : ""} />
                  <div className="col-span-2">
                    <InputField label="Adresse" value={clientAdresse} onChange={(v) => handleClientChange("adresse", v, setClientAdresse)} placeholder="Ex: 123 Rue Exemple, Marrakech" required error={touched["client_adresse"] ? clientErrors["adresse"] : ""} />
                  </div>
                  <PhoneInputField label="Téléphone" value={clientTelephone} onChange={(v) => handleClientChange("telephone", v, setClientTelephone)} error={touched["client_telephone"] ? clientErrors["telephone"] : ""} />
                  <InputField label="N° Permis de conduire" value={clientNumeroPermi} onChange={(v) => handleClientChange("numeroPermi", v, setClientNumeroPermi)} placeholder="Ex: P123456" required error={touched["client_numeroPermi"] ? clientErrors["numeroPermi"] : ""} />
                  <InputField label="Date de délivrance" type="date" value={clientDateDelivrance} onChange={(v) => handleClientChange("dateDelivrance", v, setClientDateDelivrance)} required error={touched["client_dateDelivrance"] ? clientErrors["dateDelivrance"] : ""} />
                  <InputField label="Date d'expiration" type="date" value={clientDateExpiration} onChange={(v) => handleClientChange("dateExpiration", v, setClientDateExpiration)} required error={touched["client_dateExpiration"] ? clientErrors["dateExpiration"] : ""} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setStep("extras")} className="flex items-center gap-1 px-4 h-12 rounded-xl border border-[#D5DEEF] text-[#395886] font-bold text-sm hover:bg-[#F0F3FA] transition-all">
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </button>
                  <button
                    onClick={handleClientInfoNext}
                    disabled={!isClientInfoValid()}
                    className="flex-1 h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {step === "secondDriverInfo" && (
              <motion.div key="secondDriverInfo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <div className="text-center">
                  <Users className="w-8 h-8 text-[#395886] mx-auto mb-2" />
                  <p className="text-sm text-[#395886] font-semibold">Second conducteur - Détails</p>
                  <p className="text-[10px] text-[#638ECB] font-semibold">Remplissez tous les champs ou laissez-les tous vides</p>
                </div>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <InputField label="Nom et prénom" value={sdNom} onChange={(v) => handleSdChange("nom", v, setSdNom)} placeholder="Ex: Marie Dupont" error={touched["sd_nom"] ? sdErrors["nom"] : ""} />
                  </div>
                  <InputField label="Date de naissance" type="date" value={sdDateNaissance} onChange={(v) => handleSdChange("dateNaissance", v, setSdDateNaissance)} error={touched["sd_dateNaissance"] ? sdErrors["dateNaissance"] : ""} />
                  <InputField label="N° CIN / Passeport" value={sdCin} onChange={(v) => handleSdChange("cin", v, setSdCin)} placeholder="Ex: CD789012" error={touched["sd_cin"] ? sdErrors["cin"] : ""} />
                  <div className="col-span-2">
                    <InputField label="Adresse" value={sdAdresse} onChange={(v) => handleSdChange("adresse", v, setSdAdresse)} placeholder="Ex: 456 Avenue Exemple" error={touched["sd_adresse"] ? sdErrors["adresse"] : ""} />
                  </div>
                  <PhoneInputField label="Téléphone" value={sdTelephone} onChange={(v) => handleSdChange("telephone", v, setSdTelephone)} error={touched["sd_telephone"] ? sdErrors["telephone"] : ""} />
                  <InputField label="N° Permis de conduire" value={sdNumeroPermi} onChange={(v) => handleSdChange("numeroPermi", v, setSdNumeroPermi)} placeholder="Ex: P789012" error={touched["sd_numeroPermi"] ? sdErrors["numeroPermi"] : ""} />
                  <InputField label="Date de délivrance" type="date" value={sdDateDelivrance} onChange={(v) => handleSdChange("dateDelivrance", v, setSdDateDelivrance)} error={touched["sd_dateDelivrance"] ? sdErrors["dateDelivrance"] : ""} />
                  <InputField label="Date d'expiration" type="date" value={sdDateExpiration} onChange={(v) => handleSdChange("dateExpiration", v, setSdDateExpiration)} error={touched["sd_dateExpiration"] ? sdErrors["dateExpiration"] : ""} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setStep("clientInfo")} className="flex items-center gap-1 px-4 h-12 rounded-xl border border-[#D5DEEF] text-[#395886] font-bold text-sm hover:bg-[#F0F3FA] transition-all">
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </button>
                  <button
                    onClick={handleSecondDriverNext}
                    disabled={!isSdInfoValid()}
                    className="flex-1 h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {step === "caution" && (
              <motion.div key="caution" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-[#395886] mx-auto mb-2" />
                  <p className="text-sm text-[#395886] font-semibold">Caution</p>
                </div>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}
                <InputField label="Montant de la caution (DH)" type="number" value={cautionMontant} onChange={(v) => { setCautionMontant(v); setTouched((p) => ({ ...p, caution_montant: true })); }} placeholder="Ex: 5000" error={
                  touched["caution_montant"] && cautionMontant.trim()
                    ? (isNaN(parseFloat(cautionMontant)) || parseFloat(cautionMontant) <= 0 ? "Doit être un montant valide supérieur à 0" : "")
                    : ""
                } />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#638ECB] uppercase tracking-wider">Mode de garantie</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "carte_bancaire", label: "Carte bancaire" },
                      { value: "especes", label: "Espèces" },
                      { value: "passport", label: "Passeport" },
                      { value: "autre", label: "Autre" },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setCautionMode(mode.value)}
                        className={`p-3 rounded-xl border-2 text-center transition-all text-[13px] font-bold ${
                          cautionMode === mode.value
                            ? "border-[#395886] bg-[#F0F3FA] text-[#395886]"
                            : "border-[#D5DEEF] text-[#638ECB] hover:border-[#638ECB]"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => savedChoice === "two" ? setStep("secondDriverInfo") : setStep("clientInfo")}
                    className="flex items-center gap-1 px-4 h-12 rounded-xl border border-[#D5DEEF] text-[#395886] font-bold text-sm hover:bg-[#F0F3FA] transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </button>
                  <button onClick={handleProceedToReservation} className="flex-1 h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity">
                    Confirmer la réservation
                  </button>
                </div>
              </motion.div>
            )}

            {step === "reserving" && (
              <motion.div key="reserving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
                <div className="w-10 h-10 border-4 border-[#395886] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-[#395886]">{t("reserve_modal.reserving")}</p>
              </motion.div>
            )}

            {step === "reservationError" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-extrabold text-[#395886]">{t("reserve_modal.failed")}</h3>
                <p className="text-sm text-[#638ECB] text-center leading-relaxed">{error}</p>
                <div className="w-full flex flex-col gap-2 mt-2">
                  <button onClick={() => onClose(savedChoice)} className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95">
                    {t("reserve_modal.modify_dates")}
                  </button>
                  <button onClick={() => { setError(null); setStep("caution"); }} className="w-full h-12 rounded-xl border border-[#D5DEEF] text-[#395886] font-bold text-sm hover:bg-[#F0F3FA]">
                    {t("reserve_modal.retry")}
                  </button>
                </div>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-extrabold text-[#395886]">{t("reserve_modal.success")}</h3>
                <p className="text-sm text-[#638ECB] text-center">Votre {vehicleName} a été réservé avec succès.</p>
                <div className="w-full flex flex-col gap-2 mt-2">
                  <button onClick={() => { onSuccess(); router.push("/MyReservations"); }} className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95">
                    {t("reserve_modal.view_reservations")}
                  </button>
                  <button onClick={() => onClose(savedChoice)} className="w-full h-12 rounded-xl border border-[#D5DEEF] text-[#395886] font-bold text-sm hover:bg-[#F0F3FA]">
                    {t("reserve_modal.continue_exploring")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {lightboxImage && (
        <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <button type="button" onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img src={lightboxImage} alt="" className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
