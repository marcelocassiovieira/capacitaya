import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { MessageSquare, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export function DetalleCandidato() {
  const [activeTab, setActiveTab] = useState("progreso");

  return (
    <AppLayout activePage="Detalle Candidato" userRole="tutor" userName="Ana García">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/panel-tutor">
          <button className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a la lista
          </button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 pb-12">
        {/* Columna Izquierda: Resumen */}
        <div className="w-full lg:w-[35%] space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-2xl font-bold mx-auto mb-4 border-4 border-white shadow-sm">
                CP
              </div>
              <h2 className="text-2xl font-bold text-[#1E293B]">Carlos Pérez</h2>
              <p className="text-[#64748B] font-medium">19 años · Villa Lugano</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Empleo Objetivo</p>
                <p className="font-semibold text-[#1E293B]">Operario de Almacén</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Inscrito</p>
                <p className="font-semibold text-[#1E293B]">12 Abr 2025</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Progreso</p>
                <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 uppercase">
                  Requiere atención
                </div>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * 15) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-[#1E293B]">15%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-64">
            <h3 className="font-bold text-[#1E293B] mb-4">Notas del Tutor</h3>
            <textarea
              className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-[#1E293B]"
              placeholder="Escribe tus notas privadas sobre este candidato..."
            ></textarea>
          </div>
        </div>

        {/* Columna Derecha: Paneles */}
        <div className="w-full lg:w-[65%] flex flex-col">
          <div className="flex justify-end mb-4">
            <button className="bg-[#F59E0B] hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-colors flex items-center gap-2">
              Intervenir — Abrir chat <MessageSquare className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setActiveTab('progreso')}
                className={`flex-1 py-4 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'progreso' ? 'border-[#4F46E5] text-[#4F46E5] bg-white' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'}`}
              >
                Progreso por Módulo
              </button>
              <button
                onClick={() => setActiveTab('evaluaciones')}
                className={`flex-1 py-4 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'evaluaciones' ? 'border-[#4F46E5] text-[#4F46E5] bg-white' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'}`}
              >
                Evaluaciones
              </button>
              <button
                onClick={() => setActiveTab('actividad')}
                className={`flex-1 py-4 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'actividad' ? 'border-[#4F46E5] text-[#4F46E5] bg-white' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'}`}
              >
                Actividad Reciente
              </button>
            </div>

            {/* Content Tab 1 */}
            {activeTab === 'progreso' && (
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#1E293B]">Módulo 1: Excel Básico</span>
                    <span className="text-sm font-bold text-[#10B981]">100% completado</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 -mx-4 px-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#4F46E5]">Módulo 2: Gestión Documental</span>
                    <span className="text-sm font-bold text-[#4F46E5]">20% (estancado)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: "20%" }}></div>
                  </div>
                  <p className="text-xs text-amber-700 font-medium">Lleva 4 días sin avanzar en este módulo.</p>
                </div>

                <div className="opacity-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-[#1E293B]">Módulo 3, 4, 5</span>
                    <span className="text-sm font-bold text-slate-500">Sin iniciar</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab 2 */}
            {activeTab === 'evaluaciones' && (
              <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">Módulo 1</h4>
                    <p className="text-sm text-[#64748B]">Evaluación Final</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 text-[#10B981] font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4" /> APROBADO
                    </div>
                    <p className="text-sm text-[#1E293B] font-medium">4/4 correctas</p>
                  </div>
                </div>

                <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex items-center justify-between opacity-60">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">Módulo 2</h4>
                    <p className="text-sm text-[#64748B]">Evaluación Final</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 text-slate-500 font-bold mb-1">
                      No completada
                    </div>
                    <p className="text-sm text-slate-400 font-medium">-</p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab 3 */}
            {activeTab === 'actividad' && (
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                <div className="flex gap-4 relative">
                  <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-amber-200"></div>
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 z-10">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1E293B]">Último acceso al sistema</p>
                    <p className="text-sm text-amber-600 font-bold mt-1">Hace 4 días ⚠</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-200"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-[#4F46E5] flex items-center justify-center flex-shrink-0 z-10">
                    <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-[#1E293B]">Inició Módulo 2: Gestión Documental</p>
                    <p className="text-sm text-[#64748B] mt-1">10 Abr 2025</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-200"></div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center flex-shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1E293B]">Aprobó evaluación del Módulo 1 (4/4)</p>
                    <p className="text-sm text-[#64748B] mt-1">9 Abr 2025</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center flex-shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1E293B]">Completó Módulo 1: Excel Básico</p>
                    <p className="text-sm text-[#64748B] mt-1">8 Abr 2025</p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
