"use client";

import { RequireAuth } from "@/components/RequireAuth";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <main className="flex-1">
        <div className="bg-[#F0F3FA] px-6 py-10 min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Page title */}
            <div className="mb-8">
              <h1 className="playfair text-4xl font-bold text-[#1e3a5f]">Param&egrave;tres</h1>
              <p className="text-gray-400 text-sm mt-1">G&eacute;rez votre compte et vos documents.</p>
            </div>

            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left column */}
              <div className="flex flex-col gap-5 w-full lg:w-72 flex-shrink-0">
                {/* Profile card */}
                <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-[#1e3a5f]">Alexandre Dubois</h2>
                  <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mt-1 mb-5">Membre Premium</p>
                  <button className="w-full border border-gray-300 rounded-lg py-2.5 text-xs font-semibold text-gray-600 tracking-widest uppercase hover:bg-gray-50 transition-colors">
                    Modifier le profil
                  </button>
                </div>

                {/* Required Documents card */}
                <div className="bg-white rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-[#1e3a5f] mb-4">Documents requis</h3>
                  <div className="flex flex-col gap-3">
                    {/* Driver's License */}
                    <div className="border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/>
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Permis de conduire</p>
                          <p className="text-xs text-gray-400">Recto &amp; Verso</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>

                    {/* CIN / ID */}
                    <div className="border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">CIN / ID</p>
                          <p className="text-xs text-gray-400">Recto &amp; Verso</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: Active Reservations */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-[#c8861a]">R&eacute;servations actives</h3>
                  <a href="/MyReservations" className="text-xs font-semibold text-[#c8861a] tracking-widest uppercase hover:underline">Historique &rarr;</a>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Reservation 1: Range Rover */}
                  <div className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-40 flex-shrink-0 rounded-xl overflow-hidden" style={{ minHeight: 100 }}>
                      <img
                        src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&q=80"
                        alt="Range Rover Autobiography"
                        className="w-full h-full object-cover"
                        style={{ minHeight: 100 }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-base font-bold text-[#1e3a5f] leading-tight">Range Rover<br/>Autobiography</h4>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 rounded-full px-3 py-1 tracking-wide">CONFIRM&Eacute;E</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        A&eacute;roport Marrakech Menara
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">D&eacute;part</p>
                          <p className="text-sm font-semibold text-gray-800">Oct 15, 10:00</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Retour</p>
                          <p className="text-sm font-semibold text-gray-800">Oct 20, 14:00</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reservation 2: Porsche */}
                  <div className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-40 flex-shrink-0 rounded-xl overflow-hidden" style={{ minHeight: 100 }}>
                      <img
                        src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=400&q=80"
                        alt="Porsche 911 Carrera"
                        className="w-full h-full object-cover"
                        style={{ minHeight: 100 }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-base font-bold text-[#1e3a5f] leading-tight">Porsche 911 Carrera</h4>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-3 py-1 tracking-wide">EN ATTENTE</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Bureau Gueliz
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">D&eacute;part</p>
                          <p className="text-sm font-semibold text-gray-800">Nov 02, 09:00</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Retour</p>
                          <p className="text-sm font-semibold text-gray-800">Nov 05, 18:00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
