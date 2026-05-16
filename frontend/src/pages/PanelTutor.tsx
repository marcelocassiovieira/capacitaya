import React from "react";
import { AppLayout } from "@/components/AppLayout";
import { AlertTriangle, Search, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export function PanelTutor() {
  return (
    <AppLayout activePage="Mis Candidatos" userRole="tutor" userName="Ana García">
      <div className="space-y-6 pb-12">
        {/* Banner Alerta */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-800 cursor-pointer hover:bg-red-100 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-bold">⚠ 2 candidatos llevan más de 3 días inactivos</span>
          </div>
          <div className="font-semibold flex items-center gap-1 text-sm">
            Revisar ahora <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar candidato..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex overflow-x-auto w-full sm:w-auto gap-2 pb-2 sm:pb-0">
            <button className="px-4 py-2 bg-[#4F46E5] text-white text-sm font-semibold rounded-lg whitespace-nowrap">Todos</button>
            <button className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 text-sm font-medium rounded-lg whitespace-nowrap transition-colors">En progreso</button>
            <button className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 text-sm font-medium rounded-lg whitespace-nowrap transition-colors">Requiere atención</button>
            <button className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 text-sm font-medium rounded-lg whitespace-nowrap transition-colors">Inactivos</button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-[#64748B] font-bold">
                  <th className="p-4 pl-6">Candidato</th>
                  <th className="p-4">Empleo objetivo</th>
                  <th className="p-4">Progreso general</th>
                  <th className="p-4">Última actividad</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">

                {/* Fila 1 */}
                <tr className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="p-4 pl-6">
                    <Link href="/detalle-candidato">
                      <div className="font-bold text-[#1E293B] group-hover:text-[#4F46E5] transition-colors">Lucía Ramírez</div>
                    </Link>
                  </td>
                  <td className="p-4 text-[#64748B]">Asistente Administrativa Jr.</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: "47%" }}></div>
                      </div>
                      <span className="font-semibold text-[#1E293B]">47%</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#64748B]">Hace 1 hora</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-[#4F46E5] uppercase">
                      En progreso
                    </span>
                  </td>
                </tr>

                {/* Fila 2 - Requiere atención */}
                <tr className="bg-amber-50/30 hover:bg-amber-50/60 transition-colors cursor-pointer group">
                  <td className="p-4 pl-6">
                    <Link href="/detalle-candidato">
                      <div className="font-bold text-[#1E293B] group-hover:text-[#F59E0B] transition-colors">Carlos Pérez</div>
                    </Link>
                  </td>
                  <td className="p-4 text-[#64748B]">Operario de Almacén</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: "15%" }}></div>
                      </div>
                      <span className="font-semibold text-[#1E293B]">15%</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#64748B]">Hace 4 días</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700 uppercase">
                      Requiere atención
                    </span>
                  </td>
                </tr>

                {/* Fila 3 */}
                <tr className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-[#1E293B] group-hover:text-[#4F46E5] transition-colors">Valeria Torres</div>
                  </td>
                  <td className="p-4 text-[#64748B]">Cajera de Comercio</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#10B981] rounded-full" style={{ width: "80%" }}></div>
                      </div>
                      <span className="font-semibold text-[#1E293B]">80%</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#64748B]">Hace 2 horas</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-[#10B981] uppercase">
                      En progreso
                    </span>
                  </td>
                </tr>

                {/* Fila 4 - Inactivo */}
                <tr className="bg-red-50/20 hover:bg-red-50/40 transition-colors cursor-pointer group">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-[#1E293B] group-hover:text-red-600 transition-colors">Miguel Ángel Reyes</div>
                  </td>
                  <td className="p-4 text-[#64748B]">Auxiliar Contable</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: "5%" }}></div>
                      </div>
                      <span className="font-semibold text-[#1E293B]">5%</span>
                    </div>
                  </td>
                  <td className="p-4 text-red-600 font-medium">Hace 6 días</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 uppercase">
                      Inactivo
                    </span>
                  </td>
                </tr>

                {/* Fila 5 */}
                <tr className="hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-[#1E293B] group-hover:text-[#4F46E5] transition-colors">Sofía Mendoza</div>
                  </td>
                  <td className="p-4 text-[#64748B]">Recepcionista</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: "60%" }}></div>
                      </div>
                      <span className="font-semibold text-[#1E293B]">60%</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#64748B]">Hace 1 día</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-[#4F46E5] uppercase">
                      En progreso
                    </span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
