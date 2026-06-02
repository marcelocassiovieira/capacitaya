import React, { createContext, useContext, useState, ReactNode } from "react";
import type { LearningPath, Module, Unit } from "@/lib/api";

interface LearningPathContextType {
  learningPath: LearningPath | null;
  setLearningPath: (path: LearningPath) => void;
  selectedModuleIndex: number;
  setSelectedModuleIndex: (index: number) => void;
  selectedUnitIndex: number;
  setSelectedUnitIndex: (index: number) => void;
  selectedModule: Module | null;
  selectedUnit: Unit | null;
}

const LearningPathContext = createContext<LearningPathContextType | undefined>(undefined);

export function LearningPathProvider({ children }: { children: ReactNode }) {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);

  const selectedModule = learningPath?.modules[selectedModuleIndex] || null;
  const selectedUnit = selectedModule?.units[selectedUnitIndex] || null;

  const value: LearningPathContextType = {
    learningPath,
    setLearningPath,
    selectedModuleIndex,
    setSelectedModuleIndex,
    selectedUnitIndex,
    setSelectedUnitIndex,
    selectedModule,
    selectedUnit,
  };

  return (
    <LearningPathContext.Provider value={value}>
      {children}
    </LearningPathContext.Provider>
  );
}

export function useLearningPath() {
  const context = useContext(LearningPathContext);
  if (!context) {
    throw new Error("useLearningPath must be used within LearningPathProvider");
  }
  return context;
}
