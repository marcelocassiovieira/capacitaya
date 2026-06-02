import React from "react";
import { AppLayout } from "@/components/AppLayout";
import { AlertTriangle, Search, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { users, User } from "@/lib/api";

function formatRelativeDate(dateStr: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 30) return `Hace ${diffDays} días`;
  return new Date(dateStr).toLocaleDateString("es-AR");
}

export function PanelTutor() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", "student"],
    queryFn: () => users.list({ role: "student" }),
  });

  return (
    <AppLayout activePage="Mis Candidatos" userRole="tutor" userName="Ana García">
      <div className="space-y-6 pb-12">
        {/* Banner Alerta */}
        {/* <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-red-800 cursor-pointer hover:bg-red-100 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-bold">⚠ 2 candidatos llevan más de 3 días inactivos</span>
          </div>
          <div className="font-semibold flex items-center gap-1 text-sm">
            Revisar ahora <ChevronRight className="w-4 h-4" />
          </div>
        </div> */}

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
          {isLoading && (
            <div className="text-center text-slate-400 py-12">Cargando candidatos...</div>
          )}
          {isError && (
            <div className="text-center text-slate-500 py-12">No se pudieron cargar los candidatos.</div>
          )}
          {data && data.length === 0 && (
            <div className="text-center text-slate-400 py-12">No hay candidatos registrados.</div>
          )}
          {data && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-[#64748B] font-bold">
                    <th className="p-4 pl-6">Candidato</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Progreso general</th>
                    <th className="p-4">Última actividad</th>
                    <th className="p-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.map((user: User) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                      <td className="p-4 pl-6">
                        <Link href="/detalle-candidato">
                          <div className="font-bold text-[#1E293B] group-hover:text-[#4F46E5] transition-colors">
                            {user.first_name} {user.last_name}
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 text-[#64748B]">{user.email}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-300 rounded-full" style={{ width: "0%" }}></div>
                          </div>
                          <span className="font-semibold text-[#1E293B]">0%</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#64748B]">{formatRelativeDate(user.created_at)}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-500 uppercase">
                          Sin iniciar
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
