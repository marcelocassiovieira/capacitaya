import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { X } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { jobDescriptions, skills as skillsApi, Skill, SkillLevel } from "@/lib/api";
import {
  ARGENTINIAN_PROVINCES,
  LEVEL_COLORS,
  LEVEL_LABELS,
  SKILL_LEVELS,
} from "@/lib/constants";

// Hardcoded para MVP — reemplazar por user_id del token cuando se sume auth.
// Asegurate de que exista un usuario con este ID y rol company_admin en la BD.
const COMPANY_ADMIN_USER_ID = 1;

interface SelectedSkill {
  skill_id: number;
  skill_name: string;
  level: SkillLevel;
}

export function NuevoPuesto() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Skill[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    const results = await skillsApi.search(q);
    setSuggestions(results);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(skillQuery), 300);
    return () => clearTimeout(timer);
  }, [skillQuery, fetchSuggestions]);

  const addSkill = async (skill: Skill | null, name?: string) => {
    let s = skill;
    if (!s && name) {
      try {
        s = await skillsApi.create(name);
      } catch {
        toast({ title: "Error al agregar skill", variant: "destructive" });
        return;
      }
    }
    if (!s) return;
    if (selectedSkills.some((sk) => sk.skill_id === s!.id)) return;
    setSelectedSkills((prev) => [
      ...prev,
      { skill_id: s!.id, skill_name: s!.name, level: "INTERMEDIATE" },
    ]);
    setSkillQuery("");
    setSuggestions([]);
  };

  const removeSkill = (skillId: number) => {
    setSelectedSkills((prev) => prev.filter((s) => s.skill_id !== skillId));
  };

  const updateLevel = (skillId: number, level: SkillLevel) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skill_id === skillId ? { ...s, level } : s)),
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !province || selectedSkills.length === 0) {
      toast({ title: "Completá todos los campos", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await jobDescriptions.create({
        user_id: COMPANY_ADMIN_USER_ID,
        title: title.trim(),
        description: description.trim(),
        province,
        required_skills: selectedSkills.map((s) => ({
          skill_id: s.skill_id,
          level: s.level,
        })),
      });
      toast({ title: "Puesto publicado", description: "Tu oferta ya está disponible." });
      navigate("/companies/jobs");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast({ title: "Error al publicar", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const queryLower = skillQuery.toLowerCase();
  const canAddNew =
    skillQuery.trim().length > 0 &&
    !suggestions.some((s) => s.name.toLowerCase() === queryLower);

  return (
    <AppLayout activePage="Nuevo Puesto" userRole="empresa" userName="Empresa Global S.A.">
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold mb-6">Publicar nuevo puesto</h2>

        <div className="space-y-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Título del puesto
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Backend Developer Senior"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describí las responsabilidades, requisitos y condiciones del puesto..."
              rows={5}
            />
          </div>

          {/* Provincia */}
          <div>
            <label className="block text-sm font-medium mb-1">Provincia</label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná una provincia" />
              </SelectTrigger>
              <SelectContent>
                {ARGENTINIAN_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Skills requeridas
            </label>
            <div className="relative">
              <Input
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                placeholder="Buscá o escribí una skill y presioná Enter..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && skillQuery.trim()) {
                    e.preventDefault();
                    addSkill(null, skillQuery.trim());
                  }
                }}
              />
              {(suggestions.length > 0 || canAddNew) && (
                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 first:rounded-t-xl"
                      onClick={() => addSkill(s)}
                    >
                      {s.name}
                    </button>
                  ))}
                  {canAddNew && (
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-[#4F46E5] hover:bg-indigo-50 last:rounded-b-xl border-t border-slate-100"
                      onClick={() => addSkill(null, skillQuery.trim())}
                    >
                      + Agregar &quot;{skillQuery}&quot;
                    </button>
                  )}
                </div>
              )}
            </div>

            {selectedSkills.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedSkills.map((sk) => (
                  <div
                    key={sk.skill_id}
                    className="flex items-center gap-2 flex-wrap"
                  >
                    <span className="font-medium text-sm w-28 shrink-0">
                      {sk.skill_name}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {SKILL_LEVELS.map((l) => (
                        <button
                          key={l}
                          onClick={() => updateLevel(sk.skill_id, l)}
                          className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                            sk.level === l
                              ? `${LEVEL_COLORS[l]} border-transparent`
                              : "bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          {LEVEL_LABELS[l]}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => removeSkill(sk.skill_id)}
                      className="text-slate-400 hover:text-red-400 ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            className="w-full bg-[#4F46E5] hover:bg-indigo-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publicando..." : "Publicar puesto"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
