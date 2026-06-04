import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Plus, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobDescriptions, JobDescription } from "@/lib/api";
import {
  ARGENTINIAN_PROVINCES,
  LEVEL_COLORS,
  LEVEL_LABELS,
} from "@/lib/constants";

export function ListadoPuestos() {
  const ALL = "__all__";
  const [province, setProvince] = useState<string>(ALL);

  const activeProvince = province === ALL ? undefined : province;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["job-descriptions", activeProvince],
    queryFn: () => jobDescriptions.list(activeProvince),
  });

  return (
    <AppLayout activePage="Puestos" userRole="empresa" userName="Empresa Global S.A.">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="w-64">
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las provincias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las provincias</SelectItem>
                {ARGENTINIAN_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/companies/new-job">
            <Button className="bg-[#4F46E5] hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Publicar puesto
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="text-center text-slate-400 py-12">Cargando puestos...</div>
        )}

        {isError && (
          <div className="text-center text-slate-500 py-12">
            No se pudieron cargar los puestos. Intentá de nuevo.
          </div>
        )}

        {!isLoading && data?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500 text-lg font-medium">
              No hay puestos publicados
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {activeProvince
                ? `No hay puestos en ${activeProvince}.`
                : "Publicá el primero."}
            </p>
            <Link href="/companies/new-job">
              <Button className="mt-4 bg-[#4F46E5] hover:bg-indigo-700">
                Publicar el primero
              </Button>
            </Link>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="space-y-4">
            {data.map((jd: JobDescription) => (
              <div
                key={jd.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-[#1E293B]">{jd.title}</h3>
                  <span className="text-xs text-slate-400 shrink-0 ml-4">
                    {new Date(jd.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {jd.province}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" /> {jd.posted_by.first_name}{" "}
                    {jd.posted_by.last_name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jd.required_skills.map((skill) => (
                    <span
                      key={skill.skill_id}
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${LEVEL_COLORS[skill.level]}`}
                    >
                      {skill.skill_name} · {LEVEL_LABELS[skill.level]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
