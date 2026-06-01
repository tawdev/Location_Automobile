"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { addCin, addPermi } from "@/lib/profileApi";
import { makeReservation } from "@/lib/reservationsApi";
import { vehicleImageUrl } from "@/lib/media";
import { Upload, CheckCircle, X, User, Users, FileText, IdCard } from "lucide-react";

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

type Step = "choose" | "oneDriverUpload" | "twoDrivers" | "reserving" | "reservationError" | "done";

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

  async function handleChooseOneDriver() {
    setSavedChoice("one");
    if (userHasCin && userHasPermi) {
      setStep("reserving");
      await doReservation(null);
    } else {
      setStep("oneDriverUpload");
    }
  }

  async function handleUploadAndReserve() {
    setError(null);
    setStep("reserving");
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
      await doReservation(null);
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

    setStep("reserving");
    try {
      if (cinRecto && cinVerso) {
        await addCin(cinRecto, cinVerso);
      }
      if (permiRecto && permiVerso) {
        await addPermi(permiRecto, permiVerso);
      }

      await refreshUser();
      await doReservation({
        driver2_name: driver2Name.trim(),
        driver2_cin_recto: d2CinRecto,
        driver2_cin_verso: d2CinVerso,
        driver2_permi_recto: d2PermiRecto,
        driver2_permi_verso: d2PermiVerso,
      });
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la réservation.");
      setStep("twoDrivers");
    }
  }

  async function doReservation(extra: Record<string, any> | null) {
    const formData = new FormData();
    formData.set("start_date", startDate);
    formData.set("end_date", endDate);

    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        if (value instanceof File) {
          formData.set(key, value);
        } else {
          formData.set(key, String(value));
        }
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
            <img src={vehicleImageUrl(existingUrl)} alt={label} className="h-20 w-full object-cover rounded" />
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-[#D5DEEF]/40 px-6 py-4 flex items-center justify-between z-10 rounded-t-[24px]">
          <div>
            <h2 className="text-lg font-extrabold text-[#395886]">Réservation</h2>
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
                <p className="text-sm text-[#395886] font-semibold text-center mb-2">Combien de conducteurs ?</p>
                <button onClick={handleChooseOneDriver} className="w-full p-5 rounded-xl border-2 border-[#D5DEEF] hover:border-[#395886] hover:bg-[#F0F3FA] transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F0F3FA] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#395886]" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-[#395886] text-sm">Un conducteur</div>
                    <div className="text-[11px] text-[#638ECB] font-semibold">Conduite exclusive</div>
                  </div>
                </button>
                <button onClick={() => { setSavedChoice("two"); setStep("twoDrivers"); }} className="w-full p-5 rounded-xl border-2 border-[#D5DEEF] hover:border-[#395886] hover:bg-[#F0F3FA] transition-all flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F0F3FA] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#395886]" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-[#395886] text-sm">Deux conducteurs</div>
                    <div className="text-[11px] text-[#638ECB] font-semibold">Partage de conduite</div>
                  </div>
                </button>
              </motion.div>
            )}

            {step === "oneDriverUpload" && (
              <motion.div key="oneDriver" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <p className="text-sm text-[#395886] font-semibold text-center">
                  Vous devez fournir vos documents avant de réserver.
                </p>

                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}

                {!userHasCin && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-[#395886]" />
                      <span className="text-[12px] font-bold text-[#395886]">CIN</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FileUpload label="Recto" file={cinRecto} setFile={setCinRecto} inputRef={cinRectoRef} />
                      <FileUpload label="Verso" file={cinVerso} setFile={setCinVerso} inputRef={cinVersoRef} />
                    </div>
                  </div>
                )}

                {!userHasPermi && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#395886]" />
                      <span className="text-[12px] font-bold text-[#395886]">Permis de conduire</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FileUpload label="Recto" file={permiRecto} setFile={setPermiRecto} inputRef={permiRectoRef} />
                      <FileUpload label="Verso" file={permiVerso} setFile={setPermiVerso} inputRef={permiVersoRef} />
                    </div>
                  </div>
                )}

                <button onClick={handleUploadAndReserve} className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity">
                  Uploader et réserver
                </button>
              </motion.div>
            )}

            {step === "twoDrivers" && (
              <motion.div key="twoDrivers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <p className="text-sm text-[#395886] font-semibold text-center">
                  Remplissez les informations des deux conducteurs.
                </p>

                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">{error}</div>}

                {/* Driver 1 - User */}
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
                          <span className="text-[10px] font-bold text-[#638ECB] uppercase">CIN</span>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <FileUpload label="Recto" file={cinRecto} setFile={setCinRecto} inputRef={cinRectoRef} />
                            <FileUpload label="Verso" file={cinVerso} setFile={setCinVerso} inputRef={cinVersoRef} />
                          </div>
                        </div>
                      )}
                      {!userHasPermi && (
                        <div>
                          <span className="text-[10px] font-bold text-[#638ECB] uppercase">Permis</span>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <FileUpload label="Recto" file={permiRecto} setFile={setPermiRecto} inputRef={permiRectoRef} />
                            <FileUpload label="Verso" file={permiVerso} setFile={setPermiVerso} inputRef={permiVersoRef} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Driver 2 */}
                <div className="border-t border-[#D5DEEF]/40 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#395886]" />
                    <span className="text-[12px] font-bold text-[#395886]">Second conducteur</span>
                  </div>
                  <div className="flex flex-col gap-3 ml-6 border-l-2 border-[#D5DEEF] pl-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#638ECB] uppercase block mb-1">Nom complet</label>
                      <input
                        type="text"
                        value={driver2Name}
                        onChange={(e) => setDriver2Name(e.target.value)}
                        className="w-full rounded-lg border border-[#D5DEEF] bg-white h-10 px-3 text-[13px] text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#638ECB]/40"
                        placeholder="Nom du second conducteur"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#638ECB] uppercase">CIN</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <FileUpload label="Recto" file={d2CinRecto} setFile={setD2CinRecto} inputRef={d2CinRectoRef} />
                        <FileUpload label="Verso" file={d2CinVerso} setFile={setD2CinVerso} inputRef={d2CinVersoRef} />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#638ECB] uppercase">Permis</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <FileUpload label="Recto" file={d2PermiRecto} setFile={setD2PermiRecto} inputRef={d2PermiRectoRef} />
                        <FileUpload label="Verso" file={d2PermiVerso} setFile={setD2PermiVerso} inputRef={d2PermiVersoRef} />
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={handleTwoDriversSubmit} className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95 transition-opacity mt-2">
                  Confirmer la réservation
                </button>
              </motion.div>
            )}

            {step === "reserving" && (
              <motion.div key="reserving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
                <div className="w-10 h-10 border-4 border-[#395886] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-[#395886]">Traitement de votre réservation...</p>
              </motion.div>
            )}

            {step === "reservationError" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-extrabold text-[#395886]">Réservation échouée</h3>
                <p className="text-sm text-[#638ECB] text-center leading-relaxed">{error}</p>
                <div className="w-full flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => onClose(savedChoice)}
                    className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95"
                  >
                    Modifier les dates
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      if (savedChoice === "two") {
                        setStep("twoDrivers");
                      } else {
                        handleChooseOneDriver();
                      }
                    }}
                    className="w-full h-12 rounded-xl border border-[#D5DEEF] text-[#395886] font-bold text-sm hover:bg-[#F0F3FA]"
                  >
                    Réessayer
                  </button>
                </div>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-extrabold text-[#395886]">Réservation confirmée !</h3>
                <p className="text-sm text-[#638ECB] text-center">
                  Votre {vehicleName} a été réservé avec succès.
                </p>
                <div className="w-full flex flex-col gap-2 mt-2">
                  <button onClick={() => { onSuccess(); router.push("/MyReservations"); }} className="w-full h-12 rounded-xl bg-[#395886] text-white font-extrabold text-sm hover:opacity-95">
                    Voir mes réservations
                  </button>
                  <button onClick={() => onClose(savedChoice)} className="w-full h-12 rounded-xl border border-[#D5DEEF] text-[#395886] font-bold text-sm hover:bg-[#F0F3FA]">
                    Continuer à explorer
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
