import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function Evaluacion() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AppLayout activePage="Capacitación">
      <div className="max-w-[800px] mx-auto pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">Checkpoint del Módulo</h1>
          <p className="text-[#64748B]">Módulo 2: Gestión Documental</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-[#4F46E5] rounded-full text-sm font-semibold">
            3 de 4 preguntas respondidas
          </div>
        </div>

        {/* Preguntas */}
        <div className="space-y-6 mb-8">
          {/* Pregunta 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-[#1E293B]">1. ¿Qué tipo de sistema de nomenclatura se usa para archivos digitales?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 text-[#64748B]">A) Alfabético simple</div>
              <div className="p-4 rounded-xl border-2 border-[#4F46E5] bg-indigo-50 text-[#4F46E5] font-medium relative">
                B) Año-Mes-Día_Nombre
                <div className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 text-[#64748B]">C) Colores</div>
              <div className="p-4 rounded-xl border border-slate-200 text-[#64748B]">D) Aleatorio</div>
            </div>
          </div>

          {/* Pregunta 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 opacity-80">
            <h3 className="font-bold text-lg mb-4 text-[#1E293B]">2. ¿Cuál es la ventaja principal del almacenamiento en la nube?</h3>
            <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-medium flex justify-between items-center">
              <span>A) Acceso desde cualquier lugar</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          {/* Pregunta 3: Activa */}
          <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-[#F59E0B] relative">
            <div className="absolute -top-3 left-6 px-2 bg-white text-xs font-bold text-[#F59E0B] uppercase tracking-wider">Turno actual</div>
            <h3 className="font-bold text-lg mb-4 text-[#1E293B]">3. ¿Qué significa 'archivo muerto' en gestión documental?</h3>
            <div className="grid grid-cols-1 gap-3">
              <button className="text-left p-4 rounded-xl border border-slate-200 hover:border-[#4F46E5] hover:bg-slate-50 transition-colors text-[#1E293B]">Documentos que ya no tienen vigencia y se conservan por ley</button>
              <button className="text-left p-4 rounded-xl border border-slate-200 hover:border-[#4F46E5] hover:bg-slate-50 transition-colors text-[#1E293B]">Archivos borrados de la papelera</button>
              <button className="text-left p-4 rounded-xl border border-slate-200 hover:border-[#4F46E5] hover:bg-slate-50 transition-colors text-[#1E293B]">Papeles rotos o dañados</button>
            </div>
          </div>

          {/* Pregunta 4: Bloqueada */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 bg-slate-50 opacity-60">
            <h3 className="font-bold text-lg mb-4 text-slate-400">4. ¿Cuál es el plazo máximo recomendado para archivar facturas?</h3>
            <div className="h-12 bg-slate-100 rounded-xl mb-3"></div>
            <div className="h-12 bg-slate-100 rounded-xl mb-3"></div>
          </div>
        </div>

        {submitted && (
          <div className="mt-12 pt-12 border-t-2 border-dashed border-slate-200">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-6">Resultados</h2>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100 text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2">3/4 correctas</h2>
              <div className="inline-block px-4 py-1 bg-emerald-500 text-white font-bold rounded-full text-sm mb-6 uppercase tracking-wider">APROBADO</div>
              <p className="text-lg text-[#1E293B] font-medium mb-8">¡Excelente trabajo, Lucía! Avanzas al Módulo 3.</p>

              <Link href="/progreso">
                <button className="w-full py-4 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2">
                  Ver mi progreso <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      {!submitted && (
        <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-white border-t border-slate-200 py-4 px-6 md:px-8 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button className="text-[#64748B] font-medium hover:text-[#1E293B] transition-colors underline-offset-4 hover:underline">
              Aún no estoy listo/a
            </button>

            <button
              onClick={() => setSubmitted(true)}
              className="py-3 px-8 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              Enviar respuestas <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
