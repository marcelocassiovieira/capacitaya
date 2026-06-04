import React, { useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Skill,
  SkillLevel,
  UserSkill,
  skills as skillsApi,
  userSkills,
} from "@/lib/api";
import { LEVEL_COLORS, LEVEL_LABELS, SKILL_LEVELS } from "@/lib/constants";
import { useUser } from "@/context/UserContext";

export function MisHabilidades() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const email = currentUser?.email ?? null;

  const [mySkills, setMySkills] = useState<UserSkill[]>([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Skill[]>([]);

  const { data: initialSkills } = useQuery({
    queryKey: ["user-skills", email],
    queryFn: () => userSkills.list(email!),
    enabled: !!email,
  });

  useEffect(() => {
    if (initialSkills) setMySkills(initialSkills);
  }, [initialSkills]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestions(await skillsApi.search(q));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(skillQuery), 300);
    return () => clearTimeout(timer);
  }, [skillQuery, fetchSuggestions]);

  const addSkill = async (skill: Skill | null, name?: string) => {
    if (!email) return;
    let s = skill;
    if (!s && name) {
      try {
        s = await skillsApi.create(name);
      } catch {
        toast({ title: "Error al crear skill", variant: "destructive" });
        return;
      }
    }
    if (!s) return;
    if (mySkills.some((sk) => sk.skill_id === s!.id)) return;
    try {
      const added = await userSkills.add(email, {
        skill_id: s.id,
        level: "INTERMEDIATE",
      });
      setMySkills((prev) => [...prev, added]);
    } catch {
      toast({ title: "Error al guardar skill", variant: "destructive" });
    }
    setSkillQuery("");
    setSuggestions([]);
  };

  const removeSkill = async (skillId: number) => {
    if (!email) return;
    try {
      await userSkills.remove(email, skillId);
      setMySkills((prev) => prev.filter((s) => s.skill_id !== skillId));
    } catch {
      toast({ title: "Error al eliminar skill", variant: "destructive" });
    }
  };

  const updateLevel = async (skill: UserSkill, level: SkillLevel) => {
    if (!email) return;
    try {
      await userSkills.remove(email, skill.skill_id);
      const updated = await userSkills.add(email, {
        skill_id: skill.skill_id,
        level,
      });
      setMySkills((prev) =>
        prev.map((s) => (s.skill_id === skill.skill_id ? updated : s))
      );
    } catch {
      toast({ title: "Error al actualizar nivel", variant: "destructive" });
    }
  };

  const queryLower = skillQuery.toLowerCase();
  const canAddNew =
    skillQuery.trim().length > 0 &&
    !suggestions.some((s) => s.name.toLowerCase() === queryLower);

  if (!email) {
    return (
      <AppLayout activePage="Mis Habilidades" userRole="candidato" userName="Estudiante">
        <div className="text-center text-slate-400 py-12">
          No estás logueado.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      activePage="Mis Habilidades"
      userRole="candidato"
      userName={`${currentUser!.first_name} ${currentUser!.last_name}`}
    >
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold mb-6">Mis habilidades</h2>

        <div className="space-y-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div>
            <label className="block text-sm font-medium mb-1">
              Buscá o agregá una habilidad
            </label>
            <div className="relative">
              <Input
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                placeholder="Ej: Excel, atención al cliente..."
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
          </div>

          {mySkills.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              Todavía no agregaste ninguna habilidad.
            </p>
          )}

          {mySkills.length > 0 && (
            <div className="space-y-2">
              {mySkills.map((sk) => (
                <div key={sk.skill_id} className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm w-36 shrink-0">
                    {sk.skill_name}
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {SKILL_LEVELS.map((l) => (
                      <button
                        key={l}
                        onClick={() => updateLevel(sk, l)}
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
      </div>
    </AppLayout>
  );
}
