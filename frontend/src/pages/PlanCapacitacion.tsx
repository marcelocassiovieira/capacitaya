import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Lock, Clock, ArrowRight, BookOpen, Play, Flame, Target, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { learningPaths, type Module } from "@/lib/api";
import { useLearningPath } from "@/context/LearningPathContext";
import { useUser } from "@/context/UserContext";

const PHASE_CONFIG = {
  pasion: { label: "Pasión", Icon: Flame, color: "text-rose-500", bg: "bg-rose-50" },
  play: { label: "Play", Icon: Play, color: "text-indigo-500", bg: "bg-indigo-50" },
  practica: { label: "Práctica", Icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
} as const;

const PRIORITY_CONFIG = {
  HIGH: { label: "Alta", color: "bg-rose-100 text-rose-700" },
  MEDIUM: { label: "Media", color: "bg-amber-100 text-amber-700" },
  LOW: { label: "Baja", color: "bg-slate-100 text-slate-600" },
} as const;

function totalModuleMinutes(mod: Module): number {
  return mod.units.reduce((sum, u) => sum + u.estimated_minutes, 0);
}

export function PlanCapacitacion() {
  const { currentUser } = useUser();
  const email = currentUser?.email ?? null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["learning-path", email],
    queryFn: () => learningPaths.getByStudent(email!),
    enabled: !!email,
  });

  const { setLearningPath, setSelectedModuleIndex, setSelectedUnitIndex } = useLearningPath();
  const path = data?.[0];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedModule = path?.modules[selectedIndex];

  useEffect(() => {
    if (path) {
      setLearningPath(path);
    }
  }, [path, setLearningPath]);

  if (isLoading) {
    return (
      <AppLayout activePage="Mi Plan">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4F46E5]" />
        </div>
      </AppLayout>
    );
  }

  if (isError || !path) {
    return (
      <AppLayout activePage="Mi Plan">
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#64748B]">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <p className="font-medium">No se pudo cargar el plan de capacitación.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activePage="Mi Plan">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Tu ruta de aprendizaje</h2>
              <p className="text-[#64748B] mt-1">
                {path.student_name} · {path.target_role_title} · {path.company_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-[#64748B]">Tiempo total estimado</p>
                <p className="font-bold text-[#1E293B]">{path.estimated_total_hours.toFixed(1)} hs</p>
              </div>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-right">
                <p className="text-xs text-[#64748B]">Módulos</p>
                <p className="font-bold text-[#1E293B]">{path.modules.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Module list */}
          <div className="w-full lg:w-[40%] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg mb-6 pb-4 border-b border-slate-100">Módulos</h3>
            <div className="space-y-3">
              {path.modules.map((mod, i) => {
                const minutes = totalModuleMinutes(mod);
                const isSelected = i === selectedIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full text-left flex gap-4 items-start relative p-3 rounded-xl transition-colors ${
                      isSelected
                        ? "bg-indigo-50/80 border border-indigo-100"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    {i < path.modules.length - 1 && (
                      <div
                        className={`absolute left-7 top-10 bottom-[-12px] w-0.5 ${isSelected ? "bg-indigo-200" : "bg-slate-200"}`}
                      />
                    )}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-1 ${
                        isSelected
                          ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-200 ring-4 ring-indigo-50"
                          : "bg-slate-100 border-2 border-slate-200 text-slate-400"
                      }`}
                    >
                      {isSelected ? (
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`font-bold truncate ${isSelected ? "text-[#4F46E5]" : "text-slate-700"}`}>
                          {mod.skill_name}
                        </h4>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${PRIORITY_CONFIG[mod.priority].color}`}>
                          {PRIORITY_CONFIG[mod.priority].label}
                        </span>
                      </div>
                      <p className={`text-sm flex items-center gap-1 mt-1 ${isSelected ? "text-[#4F46E5] opacity-80" : "text-slate-500"}`}>
                        <Clock className="w-3 h-3" />
                        {(minutes / 60).toFixed(1)}h · {mod.units.length} unidades
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Module detail */}
          {selectedModule && (
            <div className="w-full lg:w-[60%]">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
                <div className="h-28 bg-indigo-50 flex items-center justify-center relative overflow-hidden">
                  <BookOpen className="w-20 h-20 text-indigo-100 absolute -right-2 -bottom-4 rotate-12" />
                  <div className="w-14 h-14 bg-[#4F46E5] rounded-2xl flex items-center justify-center shadow-lg -translate-y-3">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className="p-8 -mt-8 bg-white rounded-t-3xl relative">
                  <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 ${PRIORITY_CONFIG[selectedModule.priority].color}`}>
                    Prioridad {PRIORITY_CONFIG[selectedModule.priority].label}
                  </div>
                  <h2 className="text-2xl font-bold mb-6">{selectedModule.skill_name}</h2>

                  <div className="space-y-3 mb-8">
                    {selectedModule.units.map((unit, j) => {
                      const phase = PHASE_CONFIG[unit.phase];
                      const { Icon } = phase;
                      return (
                        <div key={j} className={`flex items-start gap-4 p-4 rounded-xl ${phase.bg}`}>
                          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Icon className={`w-5 h-5 ${phase.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-bold uppercase tracking-wider ${phase.color}`}>
                              {phase.label}
                            </span>
                            <p className="font-semibold text-[#1E293B] text-sm leading-snug mt-0.5">{unit.title}</p>
                            <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {unit.estimated_minutes} min
                              {unit.exercises.length > 0 && ` · ${unit.exercises.length} ejercicios`}
                              {unit.resources.length > 0 && ` · ${unit.resources.length} recursos`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Link href="/student/modulo" onClick={() => {
                    setSelectedModuleIndex(selectedIndex);
                    setSelectedUnitIndex(0);
                  }}>
                    <button className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm">
                      Comenzar módulo <ArrowRight className="w-6 h-6" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
