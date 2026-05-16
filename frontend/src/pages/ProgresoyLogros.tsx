import React from "react";
import { AppLayout } from "@/components/AppLayout";
import { CheckCircle2, Clock, Lock, Star } from "lucide-react";

export function ProgresoyLogros() {
  return (
    <AppLayout activePage="Progreso">
      <div className="space-y-6 pb-12">
        {/* Barra de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wider">Tiempo invertido</p>
              <p className="text-2xl font-bold text-[#1E293B]">6h 30min</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wider">Módulos listos</p>
              <p className="text-2xl font-bold text-[#1E293B]">2 completados</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#64748B] uppercase tracking-wider">Evaluaciones</p>
              <p className="text-2xl font-bold text-[#1E293B]">3 aprobadas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col izquierda: Línea de tiempo */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-6">Tu Trayectoria</h3>
            <div className="space-y-0 relative pl-2">
              <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-100"></div>

              <div className="flex gap-4 relative py-4">
                <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-emerald-500"></div>
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center z-10 shadow-sm mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1E293B]">Módulo 1: Excel Básico</h4>
                  <p className="text-sm text-[#10B981] font-medium">Completado</p>
                </div>
              </div>

              <div className="flex gap-4 relative py-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-[#4F46E5] flex items-center justify-center z-10 mt-0.5 animate-pulse">
                  <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-[#4F46E5]">Módulo 2: Gestión Documental</h4>
                  <p className="text-sm text-[#4F46E5] opacity-80 font-medium">En progreso</p>
                </div>
              </div>

              <div className="flex gap-4 relative py-4 opacity-50">
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-400 flex items-center justify-center z-10 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E293B]">Módulo 3: Comunicación</h4>
                  <p className="text-sm text-[#64748B]">Pendiente</p>
                </div>
              </div>

              <div className="flex gap-4 relative py-4 opacity-50">
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-400 flex items-center justify-center z-10 mt-0.5">
                  <span className="text-xs font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E293B]">Módulo 4: Atención Cliente</h4>
                  <p className="text-sm text-[#64748B]">Pendiente</p>
                </div>
              </div>

              <div className="flex gap-4 relative py-4 opacity-50">
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 text-slate-400 flex items-center justify-center z-10 mt-0.5">
                  <span className="text-xs font-bold">5</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E293B]">Módulo 5: Evaluación Final</h4>
                  <p className="text-sm text-[#64748B]">Pendiente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col central: Logros */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-6">Tus Logros</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl mb-2">🏆</div>
                <p className="font-bold text-sm text-[#1E293B] leading-tight">Primer módulo completado</p>
              </div>

              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl mb-2">🔥</div>
                <p className="font-bold text-sm text-[#1E293B] leading-tight">Racha de 3 días</p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl mb-2">⭐</div>
                <p className="font-bold text-sm text-[#1E293B] leading-tight">Primera evaluación aprobada</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center flex flex-col items-center opacity-60 grayscale">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl mb-2">🔥</div>
                <p className="font-bold text-sm text-[#1E293B] leading-tight">Racha de 7 días</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center flex flex-col items-center opacity-60 grayscale">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl mb-2">⚡</div>
                <p className="font-bold text-sm text-[#1E293B] leading-tight">Aprendiz Veloz</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-center flex flex-col items-center opacity-60 grayscale">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl mb-2">👑</div>
                <p className="font-bold text-sm text-[#1E293B] leading-tight">Todas perfectas</p>
              </div>
            </div>
          </div>

          {/* Col derecha: Certificado */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <h3 className="font-bold text-lg mb-8 w-full text-left">Tu Certificado</h3>

            <div className="relative mb-6">
              <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-200">
                <Lock className="w-10 h-10 text-slate-300" />
              </div>
            </div>

            <h4 className="font-bold text-[#1E293B] mb-2">Completa todos los módulos para desbloquear tu certificado</h4>
            <p className="text-[#64748B] text-sm mb-8 px-4">¡Ya vas a la mitad! Sigue así.</p>

            <div className="w-full mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[#1E293B]">Progreso del certificado</span>
                <span className="text-sm font-bold text-[#4F46E5]">2 de 5 módulos</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
