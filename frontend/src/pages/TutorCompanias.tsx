import React from "react";
import { AppLayout } from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { users, User } from "@/lib/api";

export function TutorCompanias() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", "company_admin"],
    queryFn: () => users.list({ role: "company_admin" }),
  });

  return (
    <AppLayout activePage="Empresas" userRole="tutor" userName="Ana García">
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading && (
            <div className="text-center text-slate-400 py-12">Cargando empresas...</div>
          )}
          {isError && (
            <div className="text-center text-slate-500 py-12">No se pudieron cargar las empresas.</div>
          )}
          {data && data.length === 0 && (
            <div className="text-center text-slate-400 py-12">No hay empresas registradas.</div>
          )}
          {data && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-[#64748B] font-bold">
                    <th className="p-4 pl-6">Nombre</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Fecha de registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.map((user: User) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-bold text-[#1E293B]">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="p-4 text-[#64748B]">{user.email}</td>
                      <td className="p-4 text-[#64748B]">
                        {new Date(user.created_at).toLocaleDateString("es-AR")}
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
