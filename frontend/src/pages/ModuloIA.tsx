import React from "react";
import { AppLayout } from "@/components/AppLayout";
import { BrainCircuit, HelpCircle, ArrowRight, ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export function ModuloIA() {
  return (
    <AppLayout activePage="Capacitación">
      <div className="max-w-[760px] mx-auto pb-24">
        {/* Header content */}
        <div className="mb-8 text-center">
          <p className="text-[#4F46E5] font-semibold mb-2">Módulo 2: Gestión Documental</p>
          <div className="flex items-center justify-center gap-4">
            <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
            <div className="h-1.5 w-12 bg-[#4F46E5] rounded-full"></div>
            <div className="h-1.5 w-12 bg-slate-200 rounded-full"></div>
            <div className="h-1.5 w-12 bg-slate-200 rounded-full"></div>
            <div className="h-1.5 w-12 bg-slate-200 rounded-full"></div>
          </div>
          <p className="text-sm font-medium text-[#64748B] mt-3">Paso 2 de 5</p>
        </div>

        {/* IA Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px] flex flex-col mb-6">
          <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl bg-[#F1F5F9] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <BrainCircuit className="w-8 h-8 text-[#4F46E5]" />
            </div>
            <p className="text-[#64748B] italic max-w-md leading-relaxed">
              "El contenido de capacitación generado por IA aparecerá aquí. El sistema preparará una lección personalizada basada en tu perfil y ritmo de aprendizaje."
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 py-3.5 px-6 bg-white border border-slate-300 text-[#1E293B] font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-400" /> Necesito ayuda
          </button>
          <Link href="/evaluacion">
            <button className="flex-[2] w-full py-3.5 px-6 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
              Entendido, continuar <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-white border-t border-slate-200 py-4 px-6 md:px-8 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/plan">
            <button className="py-2.5 px-4 bg-white border border-slate-200 text-[#64748B] font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
          </Link>

          <div className="hidden sm:block text-sm font-bold text-[#1E293B]">
            Paso 2 de 5
          </div>

          <Link href="/canal-tutor">
            <button className="py-2.5 px-4 bg-amber-50 border border-amber-200 text-[#F59E0B] font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2 text-sm">
              Consultar con mi tutora <MessageSquare className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
