"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { addCin, addPermi } from "@/lib/profileApi";
import { makeReservation } from "@/lib/reservationsApi";
import { getExtras } from "@/lib/extrasApi";
import { getClientInfo, saveClientInfo } from "@/lib/clientApi";
import { saveReservationProgress, loadReservationProgress, clearReservationProgress } from "@/lib/reservationStorage";
import type { Extra, Country, City, Vehicle, CityLocation } from "@/lib/types";
import { fetchCountries, fetchCitiesByCountry, fetchCityLocations } from "@/lib/locationApi";
import { getVehicleById } from "@/lib/vehiclesApi";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Upload, CheckCircle, X, User, Users, FileText, IdCard, Package, Shield, ChevronLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { playConfirmationSound, prepareConfirmationSound } from "@/lib/playSound";
import { getApiOrigin } from "@/lib/media";

type FieldErrors = Record<string, string>;

export function extraImageUrl(extra: Extra): string | null {
  if (extra.image) return `${getApiOrigin()}/storage/${extra.image.replace(/^\/+/, "")}`;
  if (extra.image_url) return extra.image_url;
  return null;
}

type Choice = "one" | "two" | null;

type Props = {
  vehicleId: number;
  vehicleName: string;
  startDate: string;
  endDate: string;
  startDateTime?: string;
  endDateTime?: string;
  defaultChoice?: Choice;
  onClose: (choice?: Choice) => void;
  onSuccess: () => void;
};

type Step =
  | "choose"
  | "location"
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

function toE164(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

function toDateInputValue(date: string): string {
  if (!date) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = new Date(date);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return "";
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
        value={toE164(value) as any}
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
  startDateTime,
  endDateTime,
  defaultChoice,
  onClose,
  onSuccess,
}: Props) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();

  const [savedChoice, setSavedChoice] = useState<Choice>(() => {
    if (typeof window !== "undefined") {
      const saved = loadReservationProgress();
      if (saved && saved.vehicleId === vehicleId && saved.step !== "done" && saved.step !== "reservationError" && saved.step !== "reserving") {
        return saved.savedChoice as Choice;
      }
    }
    return defaultChoice ?? null;
  });

  const [step, setStep] = useState<Step>(() => {
    if (typeof window !== "undefined") {
      const saved = loadReservationProgress();
      if (saved && saved.vehicleId === vehicleId && saved.step !== "done" && saved.step !== "reservationError" && saved.step !== "reserving") {
        return saved.step as Step;
      }
    }
    return "choose";
  });
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

  // Location
  const [countries, setCountries] = useState<Country[]>([]);
  const [departCountryId, setDepartCountryId] = useState<number | null>(null);
  const [departCities, setDepartCities] = useState<City[]>([]);
  const [departCityId, setDepartCityId] = useState<number | null>(null);
  const [returnCountryId, setReturnCountryId] = useState<number | null>(null);
  const [returnCities, setReturnCities] = useState<City[]>([]);
  const [returnCityId, setReturnCityId] = useState<number | null>(null);
  const [departLocationType, setDepartLocationType] = useState("");
  const [returnLocationType, setReturnLocationType] = useState("");
  const [returnLocations, setReturnLocations] = useState<CityLocation[]>([]);
  const [selectedReturnLocationId, setSelectedReturnLocationId] = useState<number | null>(null);
  const [returnLocationName, setReturnLocationName] = useState("");
  const [returnLocationSupplement, setReturnLocationSupplement] = useState(0);
  const [showSupplementPopup, setShowSupplementPopup] = useState(false);
  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);
  const [pendingDepartCityId, setPendingDepartCityId] = useState<number | null>(null);

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
  const [cautionError, setCautionError] = useState("");
  const [cautionModeError, setCautionModeError] = useState("");
  const [docErrors, setDocErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Restore saved state on mount
  useEffect(() => {
    const saved = loadReservationProgress();
    if (saved && saved.vehicleId === vehicleId && saved.step !== "done" && saved.step !== "reservationError" && saved.step !== "reserving") {
      setSelectedExtraIds(saved.selectedExtraIds || []);
      if (saved.departCountryId) setDepartCountryId(saved.departCountryId);
      if (saved.departCityId) setDepartCityId(saved.departCityId);
      if (saved.returnCountryId) setReturnCountryId(saved.returnCountryId);
      if (saved.returnCityId) setReturnCityId(saved.returnCityId);
      if (saved.departLocationType) setDepartLocationType(saved.departLocationType);
      if (saved.returnLocationType) setReturnLocationType(saved.returnLocationType);
      if (saved.returnLocationName) setReturnLocationName(saved.returnLocationName);
      if (saved.returnLocationSupplement) setReturnLocationSupplement(saved.returnLocationSupplement);
      if (saved.selectedReturnLocationId) setSelectedReturnLocationId(saved.selectedReturnLocationId);
      setClientNom(saved.clientNom || "");
      setClientDateNaissance(toDateInputValue(saved.clientDateNaissance || ""));
      setClientCin(saved.clientCin || "");
      setClientAdresse(saved.clientAdresse || "");
      setClientTelephone(toE164(saved.clientTelephone || ""));
      setClientNumeroPermi(saved.clientNumeroPermi || "");
      setClientDateDelivrance(toDateInputValue(saved.clientDateDelivrance || ""));
      setClientDateExpiration(toDateInputValue(saved.clientDateExpiration || ""));
      setDriver2Name(saved.driver2Name || "");
      setSdNom(saved.sdNom || "");
      setSdDateNaissance(toDateInputValue(saved.sdDateNaissance || ""));
      setSdCin(saved.sdCin || "");
      setSdAdresse(saved.sdAdresse || "");
      setSdTelephone(toE164(saved.sdTelephone || ""));
      setSdNumeroPermi(saved.sdNumeroPermi || "");
      setSdDateDelivrance(toDateInputValue(saved.sdDateDelivrance || ""));
      setSdDateExpiration(toDateInputValue(saved.sdDateExpiration || ""));
      setCautionMontant(saved.cautionMontant || "");
      setCautionMode(saved.cautionMode || "");
    } else {
      try {
        const raw = localStorage.getItem("homeReturnLocation");
        if (raw) {
          const info = JSON.parse(raw);
          if (info.returnCountryId) setReturnCountryId(info.returnCountryId);
          if (info.returnCityId) setReturnCityId(info.returnCityId);
          if (info.returnLocationType) setReturnLocationType(info.returnLocationType);
          localStorage.removeItem("homeReturnLocation");
        }
      } catch {}
    }
  }, []);

  // Save progress whenever step changes (skip initial mount to avoid overwriting restored data)
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (step === "done") {
      clearReservationProgress();
      return;
    }
    saveReservationProgress({
      vehicleId, vehicleName, startDate, endDate, startDateTime, endDateTime,
      savedChoice, step, selectedExtraIds,
      clientNom, clientDateNaissance, clientCin, clientAdresse,
      clientTelephone, clientNumeroPermi, clientDateDelivrance, clientDateExpiration,
      driver2Name,
      sdNom, sdDateNaissance, sdCin, sdAdresse,
      sdTelephone, sdNumeroPermi, sdDateDelivrance, sdDateExpiration,
      cautionMontant, cautionMode,
      departLocationType,
      returnLocationType,
      returnLocationName,
      returnLocationSupplement,
      selectedReturnLocationId,
    });
  }, [step]);

  // Save on page close/refresh via beforeunload
  const latestState = useRef({});
  latestState.current = {
    vehicleId, vehicleName, startDate, endDate, startDateTime, endDateTime,
    savedChoice, step, selectedExtraIds,
    departCountryId, departCityId, returnCountryId, returnCityId,
    clientNom, clientDateNaissance, clientCin, clientAdresse,
    clientTelephone, clientNumeroPermi, clientDateDelivrance, clientDateExpiration,
    driver2Name,
    sdNom, sdDateNaissance, sdCin, sdAdresse,
    sdTelephone, sdNumeroPermi, sdDateDelivrance, sdDateExpiration,
    cautionMontant, cautionMode,
    departLocationType,
    returnLocationType,
    returnLocationName,
    returnLocationSupplement,
    selectedReturnLocationId,
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      const s = latestState.current as any;
      if (s.step !== "done" && s.step !== "reservationError" && s.step !== "reserving") {
        saveReservationProgress(s);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const validateClientField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "nom":
        if (!value.trim()) return "Le nom et prénom est requis";
        if (value.trim().length < 3) return "Minimum 3 caractères";
        return "";
      case "dateNaissance":
        if (!value) return "La date de naissance est requise";
        if (new Date(value) >= new Date()) return "Doit être dans le passé";
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        if (new Date(value) > eighteenYearsAgo) return "Vous devez avoir au moins 18 ans";
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
        if (clientDateNaissance) {
          const ageAtLicense = new Date(value).getFullYear() - new Date(clientDateNaissance).getFullYear();
          if (ageAtLicense < 16) return "Vous devez avoir au moins 16 ans pour obtenir un permis";
        }
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        if (new Date(value) > twoYearsAgo) return "Le permis doit avoir au moins 2 ans";
        return "";
      case "dateExpiration":
        if (!value) return "La date d'expiration est requise";
        if (clientDateDelivrance && value <= clientDateDelivrance) return "Doit être après la date de délivrance";
        return "";
      default:
        return "";
    }
  }, [clientDateDelivrance, clientDateNaissance]);

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
        const sdEighteen = new Date();
        sdEighteen.setFullYear(sdEighteen.getFullYear() - 18);
        if (new Date(value) > sdEighteen) return "Le second conducteur doit avoir au moins 18 ans";
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
        if (sdDateNaissance) {
          const sdAgeAtLicense = new Date(value).getFullYear() - new Date(sdDateNaissance).getFullYear();
          if (sdAgeAtLicense < 16) return "Le second conducteur doit avoir au moins 16 ans pour obtenir un permis";
        }
        const sdTwoYearsAgo = new Date();
        sdTwoYearsAgo.setFullYear(sdTwoYearsAgo.getFullYear() - 2);
        if (new Date(value) > sdTwoYearsAgo) return "Le permis du second conducteur doit avoir au moins 2 ans";
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

  // Auto-validate client fields whenever they change (including pre-filled data)
  useEffect(() => {
    const fields: [string, string][] = [
      ["nom", clientNom],
      ["dateNaissance", clientDateNaissance],
      ["cin", clientCin],
      ["adresse", clientAdresse],
      ["telephone", clientTelephone],
      ["numeroPermi", clientNumeroPermi],
      ["dateDelivrance", clientDateDelivrance],
      ["dateExpiration", clientDateExpiration],
    ];
    const errs: FieldErrors = {};
    for (const [k, v] of fields) {
      const e = validateClientField(k, v);
      if (e) errs[k] = e;
    }
    setClientErrors(errs);
  }, [
    clientNom, clientDateNaissance, clientCin, clientAdresse,
    clientTelephone, clientNumeroPermi, clientDateDelivrance, clientDateExpiration,
    validateClientField,
  ]);

  // Auto-validate second driver fields
  useEffect(() => {
    const fields: [string, string][] = [
      ["nom", sdNom],
      ["dateNaissance", sdDateNaissance],
      ["cin", sdCin],
      ["adresse", sdAdresse],
      ["telephone", sdTelephone],
      ["numeroPermi", sdNumeroPermi],
      ["dateDelivrance", sdDateDelivrance],
      ["dateExpiration", sdDateExpiration],
    ];
    const errs: FieldErrors = {};
    for (const [k, v] of fields) {
      const e = validateSdField(k, v);
      if (e) errs[k] = e;
    }
    setSdErrors(errs);
  }, [
    sdNom, sdDateNaissance, sdCin, sdAdresse,
    sdTelephone, sdNumeroPermi, sdDateDelivrance, sdDateExpiration,
    validateSdField,
  ]);

  useEffect(() => {
    getExtras().then(setExtras).catch(() => {});
    fetchCountries().then(setCountries).catch(() => {});
  }, []);

  // Fetch vehicle data to auto-fill departure location
  useEffect(() => {
    let cancelled = false;
    getVehicleById(vehicleId).then(vehicle => {
      if (cancelled) return;
      setVehicleData(vehicle);
      if (vehicle.current_country_id) {
        setDepartCountryId(vehicle.current_country_id);
        if (vehicle.current_city_id) {
          setPendingDepartCityId(vehicle.current_city_id);
        }
      }
      if (vehicle.location_type) {
        setDepartLocationType(vehicle.location_type);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [vehicleId]);

  useEffect(() => {
    if (departCountryId) {
      fetchCitiesByCountry(departCountryId).then(cities => {
        setDepartCities(cities);
        // Auto-select from pending if cities just loaded
        if (pendingDepartCityId !== null && cities.some(c => c.id === pendingDepartCityId)) {
          setDepartCityId(pendingDepartCityId);
          setPendingDepartCityId(null);
        }
      }).catch(() => setDepartCities([]));
    } else {
      setDepartCities([]);
    }
    if (!pendingDepartCityId) {
      setDepartCityId(null);
    }
  }, [departCountryId]);

  useEffect(() => {
    if (returnCountryId) {
      fetchCitiesByCountry(returnCountryId).then(setReturnCities).catch(() => setReturnCities([]));
    } else {
      setReturnCities([]);
    }
    setReturnCityId(null);
    setReturnLocations([]);
    setSelectedReturnLocationId(null);
    setReturnLocationName("");
    setReturnLocationSupplement(0);
  }, [returnCountryId]);

  useEffect(() => {
    if (returnCityId) {
      fetchCityLocations(returnCityId).then(setReturnLocations).catch(() => setReturnLocations([]));
    } else {
      setReturnLocations([]);
    }
    setSelectedReturnLocationId(null);
    setReturnLocationName("");
    setReturnLocationSupplement(0);
  }, [returnCityId]);

  useEffect(() => {
    if (step === "extras") {
      checkClientInfo();
    }
  }, [step]);

  function userHasProfileData(): boolean {
    return !!(
      user?.phone &&
      user?.address &&
      user?.cin_passport &&
      user?.date_of_birth &&
      user?.driver_license_number &&
      user?.license_issue_date &&
      user?.license_expiry_date
    );
  }

  function prefillFromProfile() {
    if (user?.name) setClientNom(user.name);
    if (user?.phone) setClientTelephone(toE164(user.phone));
    if (user?.address) setClientAdresse(user.address);
    if (user?.cin_passport) setClientCin(user.cin_passport);
    if (user?.date_of_birth) setClientDateNaissance(toDateInputValue(user.date_of_birth));
    if (user?.driver_license_number) setClientNumeroPermi(user.driver_license_number);
    if (user?.license_issue_date) setClientDateDelivrance(toDateInputValue(user.license_issue_date));
    if (user?.license_expiry_date) setClientDateExpiration(toDateInputValue(user.license_expiry_date));
  }

  async function checkClientInfo() {
    setCheckingClient(true);
    try {
      const client = await getClientInfo();
      if (client) {
        setExistingClient(true);
        setClientNom(client.nom_prenom);
        setClientDateNaissance(toDateInputValue(client.date_naissance));
        setClientCin(client.cin_passport);
        setClientAdresse(client.adresse);
        setClientTelephone(toE164(client.telephone));
        setClientNumeroPermi(client.numero_permi);
        setClientDateDelivrance(toDateInputValue(client.date_delivrance));
        setClientDateExpiration(toDateInputValue(client.date_expiration));
      } else {
        prefillFromProfile();
        setExistingClient(userHasProfileData());
      }
    } catch {
      prefillFromProfile();
      setExistingClient(userHasProfileData());
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
    setStep("location");
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

  function handleLocationNext() {
    if (returnCityId && returnLocations.length > 0 && !selectedReturnLocationId) {
      setError("Veuillez sélectionner un lieu de retour.");
      return;
    }
    setError(null);
    const el = document.getElementById("reserve-flow-scroll");
    if (el) el.scrollTop = 0;
    if (savedChoice === "one") {
      if (userHasCin && userHasPermi) {
        setStep("extras");
      } else {
        setStep("oneDriverUpload");
      }
    } else {
      setStep("twoDrivers");
    }
  }

  async function handleProceedToReservation() {
    setError(null);
    prepareConfirmationSound();

    // Validate second driver if 2 drivers
    if (savedChoice === "two") {
      if (!validateSecondDriver()) return;
    }

    setStep("reserving");

    const extra: Record<string, any> = {};

    // Client info
    extra.nom_prenom = clientNom.trim();
    extra.date_naissance = clientDateNaissance;
    extra.cin_passport = clientCin.trim();
    extra.adresse = clientAdresse.trim();
    extra.telephone = clientTelephone.trim();
    extra.numero_permi = clientNumeroPermi.trim();
    extra.date_delivrance = clientDateDelivrance;
    extra.date_expiration = clientDateExpiration;

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
    if (startDateTime) formData.set("date_heure_depart", startDateTime);
    if (endDateTime) formData.set("date_heure_retour", endDateTime);
    if (departCountryId) formData.set("depart_country_id", String(departCountryId));
    if (departCityId) formData.set("depart_city_id", String(departCityId));
    if (returnCountryId) formData.set("return_country_id", String(returnCountryId));
    if (returnCityId) formData.set("return_city_id", String(returnCityId));
    if (departLocationType) formData.set("depart_location_type", departLocationType);
    if (returnLocationType) formData.set("return_location_type", returnLocationType);
    if (returnLocationName) formData.set("return_location_name", returnLocationName);
    if (returnLocationSupplement > 0) formData.set("return_location_supplement", String(returnLocationSupplement));

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
      playConfirmationSound();
    } catch (e: any) {
      const errors = e?.data?.errors as Record<string, string[]> | undefined;
      const errorMsg = e?.message || "Erreur lors de la réservation.";
      const fieldList = errors ? Object.keys(errors) : [];

      // Build a readable message from field errors
      let displayMsg = errorMsg;
      if (errors) {
        const allMsgs: string[] = [];
        for (const msgs of Object.values(errors)) {
          if (Array.isArray(msgs)) allMsgs.push(...msgs);
        }
        if (allMsgs.length > 0) displayMsg = allMsgs.join(". ");
      }
      setError(displayMsg);

      // Route to the correct step based on which field(s) have errors
      const fieldSet = new Set(fieldList.map((f) => f.toLowerCase()));
      const msg = errorMsg.toLowerCase();

      if (fieldSet.has("date_naissance") || fieldSet.has("date_delivrance") || fieldSet.has("date_expiration") || msg.includes("2 ans")) {
        setStep("clientInfo");
      } else if (fieldSet.has("cin_passport") || msg.includes("cin")) {
        setStep(savedChoice === "two" ? "twoDrivers" : "oneDriverUpload");
      } else if (msg.includes("ajouter") && msg.includes("permis")) {
        setStep(savedChoice === "two" ? "twoDrivers" : "oneDriverUpload");
      } else {
        setStep("reservationError");
      }
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
                <button onClick={() => { setSavedChoice("two"); setStep("location"); }} className="w-full p-5 rounded-xl border-2 border-[#D5DEEF] hover:border-[#395886] hover:bg-[#F0F3FA] transition-all flex items-center gap-4">
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

            {step === "location" && (
              <motion.div key="location" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <p className="text-sm text-[#395886] font-semibold text-center">Lieu de prise en charge et de retour</p>
                <div className="border border-[#D5DEEF] bg-[#F0F3FA]/50 rounded-xl p-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-[#395886] uppercase tracking-wider">Prise en charge</h4>
                  <div className="text-sm text-[#395886]">
                    <span className="font-semibold">Pays : </span>
                    {(() => {
                      const c = countries.find(c => c.id === departCountryId);
                      return c ? c.name : "—";
                    })()}
                  </div>
                  <div className="text-sm text-[#395886]">
                    <span className="font-semibold">Ville : </span>
                    {(() => {
                      const c = departCities.find(c => c.id === departCityId);
                      return c ? c.name : "—";
                    })()}
                  </div>
                  <div className="text-sm text-[#395886]">
                    <span className="font-semibold">{t("reserve_modal.pickup_location_type")} : </span>
                    {departLocationType === "airport"
                      ? t("reserve_modal.location_airport")
                      : departLocationType === "citycenter"
                        ? t("reserve_modal.location_citycenter")
                        : "—"}
                  </div>
                </div>
                <div className="border border-[#D5DEEF] rounded-xl p-4 space-y-3">
                  <h4 className="text-[11px] font-bold text-[#395886] uppercase tracking-wider">Retour</h4>
                  <select
                    value={returnCountryId ?? ""}
                    onChange={(e) => setReturnCountryId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full h-[42px] bg-white border border-[#D5DEEF] rounded-xl px-3 outline-none text-[14px] text-[#395886]"
                  >
                    <option value="">Sélectionnez un pays</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={returnCityId ?? ""}
                    onChange={(e) => setReturnCityId(e.target.value ? Number(e.target.value) : null)}
                    disabled={!returnCountryId}
                    className="w-full h-[42px] bg-white border border-[#D5DEEF] rounded-xl px-3 outline-none text-[14px] text-[#395886] disabled:opacity-50"
                  >
                    <option value="">Sélectionnez une ville</option>
                    {returnCities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {returnCityId && returnLocations.length === 0 && (
                  <div className="border border-[#D5DEEF] rounded-xl p-4">
                    <p className="text-sm text-[#638ECB] text-center">Aucun lieu de retour disponible pour cette ville. Le type de lieu par défaut sera utilisé.</p>
                  </div>
                )}
                {returnCityId && returnLocations.length > 0 && (
                  <div className="border border-[#D5DEEF] rounded-xl p-4 space-y-3">
                    <h4 className="text-[11px] font-bold text-[#395886] uppercase tracking-wider">{t("reserve_modal.return_location_type")}</h4>
                    {returnLocations.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setSelectedReturnLocationId(loc.id);
                          setReturnLocationType(loc.type);
                          setReturnLocationName(loc.name);
                          setReturnLocationSupplement(Number(loc.price) || 0);
                          setShowSupplementPopup(true);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                          selectedReturnLocationId === loc.id
                            ? "border-[#f39c12] bg-[#f39c12]/10 text-[#395886] font-bold"
                            : "border-[#D5DEEF] bg-white text-[#395886] hover:bg-[#F0F3FA]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {loc.type === "airport" ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                          )}
                          {loc.name}
                        </span>
                        <span className="text-[11px] font-bold text-[#638ECB]">
                          {loc.type === "airport" ? "Aéroport" : "Centre-ville"}
                          {Number(loc.price) > 0 && ` +${Number(loc.price)} DH`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleLocationNext}
                  className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity"
                >
                  Continuer
                </button>
              </motion.div>
            )}

            {step === "oneDriverUpload" && (
              <motion.div key="oneDriver" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <p className="text-sm text-[#395886] font-semibold text-center">{t("reserve_modal.documents_required")}</p>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}
                {docErrors.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                    {docErrors.map((e, i) => (
                      <p key={i} className="text-[11px] font-semibold text-rose-600">{e}</p>
                    ))}
                  </div>
                )}
                {!userHasCin && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-[#395886]" />
                      <span className="text-[12px] font-bold text-[#395886]">{t("reserve_modal.cin")}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FileUpload label={t("reserve_modal.front")} file={cinRecto} setFile={(f) => { setCinRecto(f); setDocErrors([]); }} inputRef={cinRectoRef} />
                      <FileUpload label={t("reserve_modal.back")} file={cinVerso} setFile={(f) => { setCinVerso(f); setDocErrors([]); }} inputRef={cinVersoRef} />
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
                      <FileUpload label={t("reserve_modal.front")} file={permiRecto} setFile={(f) => { setPermiRecto(f); setDocErrors([]); }} inputRef={permiRectoRef} />
                      <FileUpload label={t("reserve_modal.back")} file={permiVerso} setFile={(f) => { setPermiVerso(f); setDocErrors([]); }} inputRef={permiVersoRef} />
                    </div>
                  </div>
                )}
                <button onClick={() => {
                  setDocErrors([]);
                  const errs: string[] = [];
                  if (!userHasCin && (!cinRecto || !cinVerso)) {
                    errs.push("Veuillez sélectionner votre CIN (recto et verso).");
                  }
                  if (!userHasPermi && (!permiRecto || !permiVerso)) {
                    errs.push("Veuillez sélectionner votre permis (recto et verso).");
                  }
                  if (errs.length > 0) {
                    setDocErrors(errs);
                    return;
                  }
                  handleUploadAndReserve();
                }} className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity">
                  {t("reserve_modal.upload_continue")}
                </button>
              </motion.div>
            )}

            {step === "twoDrivers" && (
              <motion.div key="twoDrivers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <p className="text-sm text-[#395886] font-semibold text-center">{t("reserve_modal.two_drivers_info")}</p>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}
                {docErrors.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                    {docErrors.map((e, i) => (
                      <p key={i} className="text-[11px] font-semibold text-rose-600">{e}</p>
                    ))}
                  </div>
                )}
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
                            <FileUpload label={t("reserve_modal.front")} file={cinRecto} setFile={(f) => { setCinRecto(f); setDocErrors([]); }} inputRef={cinRectoRef} />
                            <FileUpload label={t("reserve_modal.back")} file={cinVerso} setFile={(f) => { setCinVerso(f); setDocErrors([]); }} inputRef={cinVersoRef} />
                          </div>
                        </div>
                      )}
                      {!userHasPermi && (
                        <div>
                          <span className="text-[10px] font-bold text-[#638ECB] uppercase">{t("reserve_modal.drivers_license")}</span>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <FileUpload label={t("reserve_modal.front")} file={permiRecto} setFile={(f) => { setPermiRecto(f); setDocErrors([]); }} inputRef={permiRectoRef} />
                            <FileUpload label={t("reserve_modal.back")} file={permiVerso} setFile={(f) => { setPermiVerso(f); setDocErrors([]); }} inputRef={permiVersoRef} />
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
                      <label className="text-[10px] font-bold text-[#638ECB] uppercase block mb-1">
                        {t("reserve_modal.full_name")}<span className="text-rose-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={driver2Name}
                        onChange={(e) => {
                          setDriver2Name(e.target.value);
                          setTouched((p) => ({ ...p, driver2_name: true }));
                        }}
                        className={`w-full rounded-lg border bg-white h-10 px-3 text-[13px] text-[#395886] focus:outline-none focus:ring-2 transition-all ${
                          touched["driver2_name"] && !driver2Name.trim()
                            ? "border-rose-300 focus:ring-rose-300/40"
                            : "border-[#D5DEEF] focus:ring-[#638ECB]/40"
                        }`}
                        placeholder="Nom du second conducteur"
                      />
                      {touched["driver2_name"] && !driver2Name.trim() && (
                        <p className="text-[10px] font-semibold text-rose-500 mt-0.5">Le nom du second conducteur est requis</p>
                      )}
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
                <button onClick={() => {
                  setDocErrors([]);
                  const errs: string[] = [];
                  if (!driver2Name.trim()) errs.push("Le nom du second conducteur est requis.");
                  if ((!userHasCin || !userHasPermi) && (!cinRecto || !cinVerso)) errs.push("Veuillez sélectionner votre CIN (recto et verso).");
                  if ((!userHasCin || !userHasPermi) && (!permiRecto || !permiVerso)) errs.push("Veuillez sélectionner votre permis (recto et verso).");
                  if (!d2CinRecto || !d2CinVerso) errs.push("Veuillez sélectionner le CIN du second conducteur.");
                  if (!d2PermiRecto || !d2PermiVerso) errs.push("Veuillez sélectionner le permis du second conducteur.");
                  if (errs.length > 0) {
                    setDocErrors(errs);
                    if (!driver2Name.trim()) setTouched((p) => ({ ...p, driver2_name: true }));
                    return;
                  }
                  handleTwoDriversSubmit();
                }} className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity mt-2">
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
                            {(() => {
                              const eImgUrl = extraImageUrl(extra);
                              return eImgUrl ? (
                                <div onClick={() => setLightboxImage(eImgUrl)} className="shrink-0 cursor-pointer">
                                  <img src={eImgUrl} alt={extra.name} className="w-20 h-20 rounded-xl object-cover pointer-events-none" />
                                </div>
                              ) : null;
                            })()}
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
                    <InputField label="Nom et prénom" value={clientNom} onChange={(v) => handleClientChange("nom", v, setClientNom)} placeholder="Ex: Jean Dupont" required error={clientErrors["nom"] && (clientNom.trim() || touched["client_nom"]) ? clientErrors["nom"] : ""} />
                  </div>
                  <InputField label="Date de naissance" type="date" value={clientDateNaissance} onChange={(v) => handleClientChange("dateNaissance", v, setClientDateNaissance)} required error={clientErrors["dateNaissance"] && (clientDateNaissance || touched["client_dateNaissance"]) ? clientErrors["dateNaissance"] : ""} />
                  <InputField label="N° CIN / Passeport" value={clientCin} onChange={(v) => handleClientChange("cin", v, setClientCin)} placeholder="Ex: AB123456" required error={clientErrors["cin"] && (clientCin.trim() || touched["client_cin"]) ? clientErrors["cin"] : ""} />
                  <div className="col-span-2">
                    <InputField label="Adresse" value={clientAdresse} onChange={(v) => handleClientChange("adresse", v, setClientAdresse)} placeholder="Ex: 123 Rue Exemple, Marrakech" required error={clientErrors["adresse"] && (clientAdresse.trim() || touched["client_adresse"]) ? clientErrors["adresse"] : ""} />
                  </div>
                  <PhoneInputField label="Téléphone" value={clientTelephone} onChange={(v) => handleClientChange("telephone", v, setClientTelephone)} error={clientErrors["telephone"] && (clientTelephone.trim() || touched["client_telephone"]) ? clientErrors["telephone"] : ""} />
                  <InputField label="N° Permis de conduire" value={clientNumeroPermi} onChange={(v) => handleClientChange("numeroPermi", v, setClientNumeroPermi)} placeholder="Ex: P123456" required error={clientErrors["numeroPermi"] && (clientNumeroPermi.trim() || touched["client_numeroPermi"]) ? clientErrors["numeroPermi"] : ""} />
                  <InputField label="Date de délivrance" type="date" value={clientDateDelivrance} onChange={(v) => handleClientChange("dateDelivrance", v, setClientDateDelivrance)} required error={clientErrors["dateDelivrance"] && (clientDateDelivrance || touched["client_dateDelivrance"]) ? clientErrors["dateDelivrance"] : ""} />
                  <InputField label="Date d'expiration" type="date" value={clientDateExpiration} onChange={(v) => handleClientChange("dateExpiration", v, setClientDateExpiration)} required error={clientErrors["dateExpiration"] && (clientDateExpiration || touched["client_dateExpiration"]) ? clientErrors["dateExpiration"] : ""} />
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
                    <InputField label="Nom et prénom" value={sdNom} onChange={(v) => handleSdChange("nom", v, setSdNom)} placeholder="Ex: Marie Dupont" error={sdErrors["nom"] && (sdNom.trim() || touched["sd_nom"]) ? sdErrors["nom"] : ""} />
                  </div>
                  <InputField label="Date de naissance" type="date" value={sdDateNaissance} onChange={(v) => handleSdChange("dateNaissance", v, setSdDateNaissance)} error={sdErrors["dateNaissance"] && (sdDateNaissance || touched["sd_dateNaissance"]) ? sdErrors["dateNaissance"] : ""} />
                  <InputField label="N° CIN / Passeport" value={sdCin} onChange={(v) => handleSdChange("cin", v, setSdCin)} placeholder="Ex: CD789012" error={sdErrors["cin"] && (sdCin.trim() || touched["sd_cin"]) ? sdErrors["cin"] : ""} />
                  <div className="col-span-2">
                    <InputField label="Adresse" value={sdAdresse} onChange={(v) => handleSdChange("adresse", v, setSdAdresse)} placeholder="Ex: 456 Avenue Exemple" error={sdErrors["adresse"] && (sdAdresse.trim() || touched["sd_adresse"]) ? sdErrors["adresse"] : ""} />
                  </div>
                  <PhoneInputField label="Téléphone" value={sdTelephone} onChange={(v) => handleSdChange("telephone", v, setSdTelephone)} error={sdErrors["telephone"] && (sdTelephone.trim() || touched["sd_telephone"]) ? sdErrors["telephone"] : ""} />
                  <InputField label="N° Permis de conduire" value={sdNumeroPermi} onChange={(v) => handleSdChange("numeroPermi", v, setSdNumeroPermi)} placeholder="Ex: P789012" error={sdErrors["numeroPermi"] && (sdNumeroPermi.trim() || touched["sd_numeroPermi"]) ? sdErrors["numeroPermi"] : ""} />
                  <InputField label="Date de délivrance" type="date" value={sdDateDelivrance} onChange={(v) => handleSdChange("dateDelivrance", v, setSdDateDelivrance)} error={sdErrors["dateDelivrance"] && (sdDateDelivrance || touched["sd_dateDelivrance"]) ? sdErrors["dateDelivrance"] : ""} />
                  <InputField label="Date d'expiration" type="date" value={sdDateExpiration} onChange={(v) => handleSdChange("dateExpiration", v, setSdDateExpiration)} error={sdErrors["dateExpiration"] && (sdDateExpiration || touched["sd_dateExpiration"]) ? sdErrors["dateExpiration"] : ""} />
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
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#638ECB] uppercase tracking-wider">
                    Montant de la caution (DH)<span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cautionMontant}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const sanitized = raw.replace(/\D/g, "");
                      setCautionMontant(sanitized);
                      setTouched((p) => ({ ...p, caution_montant: true }));
                      if (!sanitized) {
                        setCautionError("Le montant de la caution est requis");
                      } else if (parseFloat(sanitized) <= 0) {
                        setCautionError("Doit être un montant supérieur à 0");
                      } else {
                        setCautionError("");
                      }
                    }}
                    className={`w-full rounded-lg border bg-white h-10 px-3 text-[13px] text-[#395886] focus:outline-none focus:ring-2 transition-all ${
                      cautionError && (cautionMontant || touched["caution_montant"])
                        ? "border-rose-300 focus:ring-rose-300/40"
                        : "border-[#D5DEEF] focus:ring-[#638ECB]/40"
                    }`}
                    placeholder="Ex: 5000"
                  />
                  {cautionError && (cautionMontant || touched["caution_montant"]) && (
                    <p className="text-[10px] font-semibold text-rose-500 mt-0.5">{cautionError}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#638ECB] uppercase tracking-wider">
                    Mode de garantie<span className="text-rose-500 ml-0.5">*</span>
                  </label>
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
                        onClick={() => {
                          setCautionMode(mode.value);
                          setCautionModeError("");
                          setTouched((p) => ({ ...p, caution_mode: true }));
                        }}
                        className={`p-3 rounded-xl border-2 text-center transition-all text-[13px] font-bold ${
                          cautionMode === mode.value
                            ? "border-[#395886] bg-[#F0F3FA] text-[#395886]"
                            : "border-[#D5DEEF] text-[#638ECB] hover:border-[#638ECB]"
                        } ${cautionModeError && touched["caution_mode"] ? "border-rose-300" : ""}`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  {cautionModeError && touched["caution_mode"] && (
                    <p className="text-[10px] font-semibold text-rose-500 mt-0.5">{cautionModeError}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      if (existingClient) {
                        savedChoice === "two" ? setStep("secondDriverInfo") : setStep("extras");
                      } else {
                        savedChoice === "two" ? setStep("secondDriverInfo") : setStep("clientInfo");
                      }
                    }}
                    className="flex items-center gap-1 px-4 h-12 rounded-xl border border-[#D5DEEF] text-[#395886] font-bold text-sm hover:bg-[#F0F3FA] transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </button>
                  <button
                    onClick={() => {
                      // Validate caution on submit click
                      if (!cautionMontant) {
                        setCautionError("Le montant de la caution est requis");
                        setTouched((p) => ({ ...p, caution_montant: true }));
                      }
                      if (!cautionMode) {
                        setCautionModeError("Veuillez sélectionner un mode de garantie");
                        setTouched((p) => ({ ...p, caution_mode: true }));
                      }
                      if (cautionMontant && cautionMode && !cautionError) {
                        handleProceedToReservation();
                      }
                    }}
                    disabled={!!cautionError || !cautionMontant || !cautionMode}
                    className="flex-1 h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
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

      {showSupplementPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSupplementPopup(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#f39c12]/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#f39c12]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
              </div>
              <h3 className="text-lg font-bold text-[#395886]">Supplément de retour</h3>
              <p className="text-sm text-[#638ECB]">
                Vous avez sélectionné <strong>{returnLocationName}</strong> comme lieu de retour.
              </p>
              {returnLocationSupplement > 0 ? (
                <div className="bg-[#f39c12]/10 border border-[#f39c12]/30 rounded-xl px-5 py-3">
                  <span className="text-2xl font-extrabold text-[#f39c12]">+{returnLocationSupplement} DH</span>
                  <p className="text-[11px] text-[#638ECB] mt-1">Supplément ajouté au prix total</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3">
                  <span className="text-lg font-extrabold text-green-600">Aucun supplément</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowSupplementPopup(false)}
                className="w-full h-11 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
