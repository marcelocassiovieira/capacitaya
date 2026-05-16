import React from "react";
import { AppLayout } from "@/components/AppLayout";
import { Check, Lock, Star, Clock, FileText, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function PlanCapacitacion() {
  return (
    <AppLayout activePage="Mi Plan">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold">Tu ruta de aprendizaje</h2>
              <p className="text-[#64748B]">Tiempo total estimado: 3 semanas · 12 horas</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-indigo-50 text-[#4F46E5] font-bold px-3 py-1 rounded-lg text-sm mb-2">47% completado</span>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#4F46E5] rounded-full transition-all duration-1000" style={{ width: "47%" }}></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Columna Izquierda: Lista de módulos */}
          <div className="w-full lg:w-[40%] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg">Módulos</h3>
              <div className="flex items-center gap-1 text-sm font-semibold text-[#F59E0B] bg-amber-50 px-2.5 py-1 rounded-md">
                <Star className="w-4 h-4 fill-current" /> 520 XP ganados
              </div>
            </div>

            <div className="space-y-4">
              {/* Modulo 1: Completado */}
              <div className="flex gap-4 items-start relative p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="absolute left-7 top-10 bottom-[-16px] w-0.5 bg-emerald-500"></div>
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center flex-shrink-0 z-10 mt-1">
                  <Check className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[#1E293B] line-through decoration-slate-400">Módulo 1: Excel Básico</h4>
                    <span className="text-xs font-semibold bg-emerald-100 text-[#10B981] px-2 py-0.5 rounded uppercase">Completado</span>
                  </div>
                  <p className="text-sm text-[#64748B] flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 2h</p>
                </div>
              </div>

              {/* Modulo 2: En progreso */}
              <div className="flex gap-4 items-start relative p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div className="absolute left-7 top-10 bottom-[-16px] w-0.5 bg-slate-200"></div>
                <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center flex-shrink-0 z-10 mt-1 shadow-md shadow-indigo-200 ring-4 ring-indigo-50">
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[#4F46E5]">Módulo 2: Gestión Documental</h4>
                    <span className="text-xs font-semibold bg-indigo-100 text-[#4F46E5] px-2 py-0.5 rounded uppercase">En Progreso</span>
                  </div>
                  <p className="text-sm text-[#4F46E5] opacity-80 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 2.5h</p>
                </div>
              </div>

              {/* Modulo 3: Pendiente */}
              <div className="flex gap-4 items-start relative p-3 rounded-xl opacity-60">
                <div className="absolute left-7 top-10 bottom-[-16px] w-0.5 bg-slate-200"></div>
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0 z-10 mt-1">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-700">Módulo 3: Comunicación Escrita</h4>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Pendiente</span>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 3h</p>
                </div>
              </div>

              {/* Modulo 4: Pendiente */}
              <div className="flex gap-4 items-start relative p-3 rounded-xl opacity-60">
                <div className="absolute left-7 top-10 bottom-[-16px] w-0.5 bg-slate-200"></div>
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0 z-10 mt-1">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-700">Módulo 4: Atención al Cliente</h4>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Pendiente</span>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 2h</p>
                </div>
              </div>

              {/* Modulo 5: Pendiente */}
              <div className="flex gap-4 items-start relative p-3 rounded-xl opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-400 flex items-center justify-center flex-shrink-0 z-10 mt-1">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-700">Módulo 5: Evaluación Final</h4>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Pendiente</span>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 1h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Detalle del módulo seleccionado */}
          <div className="w-full lg:w-[60%]">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
              <div className="h-32 bg-indigo-50 relative overflow-hidden flex items-center justify-center">
                <FileText className="w-16 h-16 text-indigo-200 absolute -right-4 -bottom-4 transform rotate-12" />
                <div className="w-16 h-16 bg-[#4F46E5] rounded-2xl flex items-center justify-center shadow-lg transform -translate-y-4">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="p-8 relative -mt-10 bg-white rounded-t-3xl">
                <div className="inline-block bg-indigo-100 text-[#4F46E5] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                  Módulo Actual
                </div>
                <h2 className="text-2xl font-bold mb-4">Módulo 2: Gestión Documental</h2>

                <p className="text-[#64748B] text-lg leading-relaxed mb-8">
                  Aprenderás a organizar, archivar y gestionar documentos digitales y físicos, usando herramientas estándar de oficina.
                </p>

                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-[#1E293B] mb-3">Habilidades que desarrollarás:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Archivo digital</span>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Nomenclatura de archivos</span>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">Herramientas de nube</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-8 text-[#64748B]">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-5 h-5" /> 2.5 horas
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> 3 pasos
                  </div>
                </div>

                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">Tu progreso en este módulo</span>
                    <span className="font-bold text-sm text-[#4F46E5]">33%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: "33%" }}></div>
                  </div>
                </div>

                <Link href="/modulo">
                  <button className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm">
                    Continuar módulo <ArrowRight className="w-6 h-6" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
