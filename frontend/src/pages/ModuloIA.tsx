import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { HelpCircle, ArrowRight, ArrowLeft, MessageSquare, Flame, Play, Target, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLearningPath } from "@/context/LearningPathContext";
import { attempts } from "@/lib/api";

const PHASE_ORDER = ["pasion", "play", "practica"] as const;
const PHASE_LABELS = { pasion: "Pasión", play: "Play", practica: "Práctica" };
const PHASE_ICONS = { pasion: Flame, play: Play, practica: Target };

export function ModuloIA() {
  const { learningPath, selectedModule, selectedModuleIndex, selectedUnitIndex, setSelectedUnitIndex } = useLearningPath();
  const [, navigate] = useLocation();
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  if (!learningPath || !selectedModule) {
    return (
      <AppLayout activePage="Capacitación">
        <div className="flex items-center justify-center h-64 text-[#64748B]">
          <p>No hay módulo seleccionado. Vuelve a Tu Plan.</p>
        </div>
      </AppLayout>
    );
  }

  const selectedUnit = selectedModule.units[selectedUnitIndex];
  const totalUnits = selectedModule.units.length;
  const currentStep = selectedUnitIndex + 1;
  const phaseIndex = PHASE_ORDER.indexOf(selectedUnit.phase);

  const handleNext = () => {
    if (selectedUnitIndex < totalUnits - 1) {
      setSelectedUnitIndex(selectedUnitIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (selectedUnitIndex > 0) {
      setSelectedUnitIndex(selectedUnitIndex - 1);
    }
  };

  const handleSubmitAnswer = async (exerciseIndex: number, answer: string) => {
    setSelectedAnswers({ ...selectedAnswers, [exerciseIndex]: answer });

    if (selectedModule.units[selectedUnitIndex].exercises[exerciseIndex].expected_answer === answer) {
      // Correct answer - submit attempt
      try {
        await attempts.create({
          student_email: learningPath.student_email,
          learning_path_id: learningPath.id,
          module_index: selectedModuleIndex,
          unit_index: selectedUnitIndex,
          exercise_index: exerciseIndex,
          answer,
        });
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }
  };

  const PhaseIcon = PHASE_ICONS[selectedUnit.phase];

  return (
    <AppLayout activePage="Capacitación">
      <div className="max-w-[760px] mx-auto pb-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-[#4F46E5] font-semibold mb-2">
            {selectedModule.skill_name} · {PHASE_LABELS[selectedUnit.phase]}
          </p>
          <div className="flex items-center justify-center gap-2">
            {PHASE_ORDER.map((phase, i) => (
              <div
                key={phase}
                className={`h-1.5 w-12 rounded-full transition-colors ${
                  i < phaseIndex
                    ? "bg-emerald-500"
                    : i === phaseIndex
                      ? "bg-[#4F46E5]"
                      : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-[#64748B] mt-3">Paso {currentStep} de {totalUnits}</p>
        </div>

        {/* Unit Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              selectedUnit.phase === "pasion" ? "bg-rose-50" :
              selectedUnit.phase === "play" ? "bg-indigo-50" : "bg-emerald-50"
            }`}>
              <PhaseIcon className={`w-6 h-6 ${
                selectedUnit.phase === "pasion" ? "text-rose-500" :
                selectedUnit.phase === "play" ? "text-indigo-500" : "text-emerald-500"
              }`} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#1E293B]">{selectedUnit.title}</h2>
              <p className="text-sm text-[#64748B] mt-1">
                {selectedUnit.estimated_minutes} min de contenido
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none mb-8">
            <p className="text-[#64748B] leading-relaxed whitespace-pre-wrap">{selectedUnit.content}</p>
          </div>

          {/* Exercises */}
          {selectedUnit.exercises.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="font-bold text-lg mb-4">Ejercicios ({selectedUnit.exercises.length})</h3>
              <div className="space-y-3">
                {selectedUnit.exercises.map((exercise, i) => {
                  const options = exercise.prompt.split("\n").filter(line => line.trim().match(/^[A-D]\)/));
                  const isCorrect = selectedAnswers[i] === exercise.expected_answer;
                  const isAnswered = i in selectedAnswers;

                  return (
                    <div
                      key={i}
                      className={`border rounded-lg overflow-hidden transition-colors ${
                        isAnswered
                          ? isCorrect
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-rose-200 bg-rose-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedExercise(expandedExercise === i ? null : i)}
                        className="w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50"
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-[#4F46E5] flex items-center justify-center flex-shrink-0 mt-1 text-sm font-bold text-[#4F46E5]">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1E293B]">
                            {exercise.prompt.split("\n")[0]}
                          </p>
                          {isAnswered && (
                            <p className="text-sm mt-1 font-medium">
                              {isCorrect ? "✓ Respuesta correcta" : "✗ Respuesta incorrecta"}
                            </p>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                            expandedExercise === i ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {expandedExercise === i && (
                        <div className="px-4 pb-4 space-y-3 border-t border-slate-200">
                          {options.map((option, j) => {
                            const letter = option.charAt(0);
                            const isSelected = selectedAnswers[i] === letter;
                            return (
                              <button
                                key={j}
                                onClick={() => handleSubmitAnswer(i, letter)}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                  isSelected
                                    ? isCorrect
                                      ? "border-emerald-500 bg-emerald-50"
                                      : "border-rose-500 bg-rose-50"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <p className="font-medium text-[#1E293B]">
                                  {option.slice(3)}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resources */}
          {selectedUnit.resources.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="font-bold text-lg mb-4">Recursos ({selectedUnit.resources.length})</h3>
              <div className="space-y-2">
                {selectedUnit.resources.map((resource, i) => (
                  <a
                    key={i}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-medium text-[#4F46E5] hover:underline">{resource.title}</p>
                    <p className="text-xs text-[#64748B] mt-1">{resource.type}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 py-3.5 px-6 bg-white border border-slate-300 text-[#1E293B] font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-400" /> Necesito ayuda
          </button>
          <button
            onClick={handleNext}
            disabled={selectedUnitIndex >= totalUnits - 1}
            className="flex-[2] py-3.5 px-6 bg-[#4F46E5] hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {selectedUnitIndex >= totalUnits - 1 ? "Completado" : "Siguiente unidad"}
            {selectedUnitIndex < totalUnits - 1 && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-white border-t border-slate-200 py-4 px-6 md:px-8 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/student/plan">
            <button className="py-2.5 px-4 bg-white border border-slate-200 text-[#64748B] font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Volver al plan
            </button>
          </Link>

          <div className="hidden sm:block text-sm font-bold text-[#1E293B]">
            Paso {currentStep} de {totalUnits}
          </div>

          <Link href="/student/canal-tutor">
            <button className="py-2.5 px-4 bg-amber-50 border border-amber-200 text-[#F59E0B] font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2 text-sm">
              Consultar con mi tutora <MessageSquare className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
