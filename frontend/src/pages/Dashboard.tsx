import React from "react";
import { AppLayout } from "@/components/AppLayout";
import { CheckCircle2, ArrowRight, MessageSquare, Clock, Check, BookOpen } from "lucide-react";
import { Link } from "wouter";

export function Dashboard() {
  return (
    <AppLayout activePage="Inicio">
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-[#4F46E5] rounded-2xl p-8 text-white shadow-sm overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Bienvenid@ de nuevo, Lucía!</h1>
            <p className="text-indigo-100 text-lg">Capacitación para: Asistente Administrativa Jr. en Empresa Global S.A.</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 right-32 w-32 h-32 bg-white opacity-5 rounded-full translate-y-1/4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col izquierda */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
              <h3 className="font-bold text-lg mb-6">Tu Progreso General</h3>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * 47) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#1E293B]">47%</span>
                  </div>
                </div>
                <p className="text-center font-medium text-[#1E293B]">¡Vas por la mitad del camino!</p>
                <p className="text-center text-sm text-[#64748B] mt-1">Sigue así, estás cada vez más cerca.</p>
              </div>
            </div>
          </div>

          {/* Col central/derecha */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
              <h3 className="font-bold text-lg mb-6">Habilidades en Proceso</h3>

              <div className="space-y-6 flex-1">
                <div>
                  <h4 className="text-sm font-semibold text-[#64748B] mb-3 uppercase tracking-wider">Por mejorar</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-amber-50 text-[#F59E0B] border border-amber-200 rounded-lg text-sm font-medium">Excel avanzado</span>
                    <span className="px-3 py-1.5 bg-amber-50 text-[#F59E0B] border border-amber-200 rounded-lg text-sm font-medium">Gestión documental</span>
                    <span className="px-3 py-1.5 bg-amber-50 text-[#F59E0B] border border-amber-200 rounded-lg text-sm font-medium">Comunicación escrita</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#64748B] mb-3 uppercase tracking-wider">Ya cubiertas</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-emerald-50 text-[#10B981] border border-emerald-200 rounded-lg text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Office básico
                    </span>
                    <span className="px-3 py-1.5 bg-emerald-50 text-[#10B981] border border-emerald-200 rounded-lg text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Correo electrónico profesional
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link href="/modulo">
                  <button className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold transition-colors">
                    Continuar capacitación <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Fila inferior */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
              <h3 className="font-bold text-lg mb-4">Tu Tutora</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-[#4F46E5] text-xl font-bold">
                    AG
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#10B981] border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <div className="font-bold text-lg">Ana García</div>
                  <div className="text-sm text-[#10B981] font-medium">En línea</div>
                </div>
              </div>
              <Link href="/canal-tutor">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-sm font-semibold rounded-xl text-[#1E293B] hover:bg-slate-50 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Enviar mensaje
                </button>
              </Link>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
              <h3 className="font-bold text-lg mb-6">Actividad Reciente</h3>
              <div className="space-y-6">
                <div className="flex gap-4 relative">
                  <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center flex-shrink-0 z-10">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Completaste el Módulo 1: Excel Básico</p>
                    <p className="text-sm text-[#64748B] flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> hace 2 días</p>
                  </div>
                </div>
                <div className="flex gap-4 relative">
                  <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center flex-shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Aprobaste tu primera evaluación ✓</p>
                    <p className="text-sm text-[#64748B] flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> hace 3 días</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#4F46E5] flex items-center justify-center flex-shrink-0 z-10">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Iniciaste tu plan de capacitación</p>
                    <p className="text-sm text-[#64748B] flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> hace 5 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
