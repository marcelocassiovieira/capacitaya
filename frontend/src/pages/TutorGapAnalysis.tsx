import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import {
  GapAnalysis,
  GapAnalysisWithPlan,
  JobDescription,
  User,
  gapAnalyses,
  jobDescriptions,
  users,
} from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  READY: "bg-emerald-50 text-emerald-700",
  NEEDS_WORK: "bg-amber-50 text-amber-700",
  MISSING: "bg-red-50 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  READY: "Listo",
  NEEDS_WORK: "Necesita trabajo",
  MISSING: "Faltante",
};

export function TutorGapAnalysis() {
  const [studentId, setStudentId] = useState<string>("");
  const [jdId, setJdId] = useState<string>("");
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<GapAnalysis | null>(null);
  const [planResult, setPlanResult] = useState<GapAnalysisWithPlan | null>(null);
  const [isPlanPending, setIsPlanPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  const { data: studentList } = useQuery({
    queryKey: ["users", "student"],
    queryFn: () => users.list({ role: "student" }),
  });

  const { data: jdList } = useQuery({
    queryKey: ["job-descriptions"],
    queryFn: () => jobDescriptions.list(),
  });

  const selectedStudent = studentList?.find((u: User) => String(u.id) === studentId);
  const selectedJd = jdList?.find((jd: JobDescription) => String(jd.id) === jdId);
  const canSubmit = Boolean(selectedStudent && selectedJd && !isPending);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent || !selectedJd) return;

    setIsPending(true);
    setError(null);
    setResult(null);
    setPlanResult(null);

    try {
      const analysis = await gapAnalyses.create({
        student_email: selectedStudent.email,
        job_description_id: selectedJd.id,
      });
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar la brecha.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleGeneratePlan() {
    if (!result) return;
    setIsPlanPending(true);
    setPlanError(null);
    try {
      const plan = await gapAnalyses.generateLearningPath(result.student_email);
      setPlanResult(plan);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Error al generar el plan.");
    } finally {
      setIsPlanPending(false);
    }
  }

  return (
    <AppLayout activePage="Nueva evaluación" userRole="tutor" userName="Ana García">
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-[#1E293B] mb-6">Evaluación de brecha</h2>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Student dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Estudiante</label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {(studentList ?? []).map((u: User) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.first_name} {u.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* JD dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Puesto</label>
              <Select value={jdId} onValueChange={setJdId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná un puesto" />
                </SelectTrigger>
                <SelectContent>
                  {(jdList ?? []).map((jd: JobDescription) => (
                    <SelectItem key={jd.id} value={String(jd.id)}>
                      {jd.title} — {jd.posted_by.first_name} {jd.posted_by.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? "Analizando..." : "Analizar brecha"}
            </Button>
          </form>
        </div>

        {/* Gap analysis result */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-[#4F46E5]">
                {result.readiness_score}%
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  Puntaje de preparación
                </div>
                <div className="text-sm text-slate-600 mt-1">{result.summary}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-[#64748B] font-bold">
                    <th className="p-3">Habilidad</th>
                    <th className="p-3">Nivel actual</th>
                    <th className="p-3">Nivel requerido</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.gap_report.skills.map((skill) => (
                    <tr key={skill.name}>
                      <td className="p-3 font-medium text-[#1E293B]">{skill.name}</td>
                      <td className="p-3 text-slate-500">{skill.current_level}</td>
                      <td className="p-3 text-slate-500">{skill.required_level}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${STATUS_COLORS[skill.status] ?? "bg-slate-100 text-slate-500"}`}
                        >
                          {STATUS_LABELS[skill.status] ?? skill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Generate plan section */}
            {!planResult && (
              <div className="pt-2 border-t border-slate-100">
                {planError && (
                  <div className="text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-3">{planError}</div>
                )}
                <Button
                  onClick={handleGeneratePlan}
                  disabled={isPlanPending}
                  className="w-full bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isPlanPending ? "Generando plan..." : "Generar plan de aprendizaje"}
                </Button>
              </div>
            )}

            {planResult && (
              <div className="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">
                Plan de aprendizaje generado (ID: {planResult.learning_path.id})
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
