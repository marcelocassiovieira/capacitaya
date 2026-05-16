import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Send, Paperclip, FileText, Link as LinkIcon } from "lucide-react";

export function CanalTutor() {
  const [message, setMessage] = useState("");

  return (
    <AppLayout activePage="Mi Tutor">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        {/* Panel izquierdo: Info tutor */}
        <div className="w-full lg:w-[30%] bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 text-center border-b border-slate-100">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-[#4F46E5] text-3xl font-bold mx-auto border-4 border-white shadow-sm">
                AG
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#10B981] border-2 border-white rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold text-[#1E293B]">Ana García</h2>
            <p className="text-[#64748B] font-medium mb-2">Orientadora Laboral</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#10B981] text-xs font-bold rounded-full uppercase tracking-wider mb-4">
              En línea ahora
            </div>
            <p className="text-sm text-[#1E293B] bg-slate-50 p-4 rounded-xl leading-relaxed italic">
              "Especialista en inserción laboral juvenil con 5 años de experiencia. Aquí para acompañarte en cada paso."
            </p>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4">Recursos compartidos</h3>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1E293B] truncate">Guía de archivo digital.pdf</p>
                  <p className="text-xs text-[#64748B]">Documento PDF</p>
                </div>
              </a>

              <a href="#" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1E293B] truncate">Tutorial: Google Drive para principiantes</p>
                  <p className="text-xs text-[#64748B]">Enlace web</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Panel derecho: Chat */}
        <div className="w-full lg:w-[70%] bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
          {/* Cabecera del chat */}
          <div className="p-4 border-b border-slate-100 bg-white z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-[#4F46E5] font-bold">
                AG
              </div>
              <div>
                <h3 className="font-bold text-[#1E293B]">Conversación con Ana</h3>
              </div>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {/* Mensaje de Ana */}
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#4F46E5] text-xs font-bold flex-shrink-0 mt-auto mb-1">
                AG
              </div>
              <div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm text-[#1E293B]">
                  ¡Hola Lucía! Veo que terminaste el primer módulo. ¿Cómo te fue?
                </div>
                <div className="text-xs text-[#64748B] mt-1 ml-1 font-medium">10:30 AM</div>
              </div>
            </div>

            {/* Mensaje de Lucía (Yo) */}
            <div className="flex gap-4 max-w-[85%] ml-auto justify-end">
              <div className="flex flex-col items-end">
                <div className="bg-[#4F46E5] p-4 rounded-2xl rounded-br-none shadow-sm text-white">
                  ¡Hola Ana! Me fue bien, aunque la parte de Excel estuvo complicada al principio.
                </div>
                <div className="text-xs text-[#64748B] mt-1 mr-1 font-medium">10:38 AM</div>
              </div>
            </div>

            {/* Mensaje de Ana (Nudge) */}
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#4F46E5] text-xs font-bold flex-shrink-0 mt-auto mb-1">
                AG
              </div>
              <div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm text-[#1E293B]">
                  Noto que estás en el paso 2 del Módulo 2. Aquí te dejo un consejo: siempre usa fechas en el nombre del archivo para evitar confusiones 📁
                </div>
                <div className="text-xs text-[#64748B] mt-1 ml-1 font-medium">Nudge de Ana · 10:45 AM</div>
              </div>
            </div>

            {/* Indicador de escritura */}
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#4F46E5] text-xs font-bold flex-shrink-0">
                AG
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>

            <div className="text-xs text-[#64748B] ml-14 animate-pulse">Ana está escribiendo...</div>
          </div>

          {/* Barra de entrada */}
          <div className="p-4 bg-white border-t border-slate-200 z-10">
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full text-[#64748B] hover:bg-slate-100 flex items-center justify-center transition-colors flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-[#1E293B]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="w-12 h-12 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-sm">
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
