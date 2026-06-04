import type { SkillLevel } from "./api";

export const ARGENTINIAN_PROVINCES: string[] = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export const SKILL_LEVELS: SkillLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "PRO",
];

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
  PRO: "Pro",
};

export const LEVEL_COLORS: Record<SkillLevel, string> = {
  BEGINNER: "bg-gray-100 text-gray-700",
  INTERMEDIATE: "bg-blue-100 text-blue-700",
  ADVANCED: "bg-orange-100 text-orange-700",
  PRO: "bg-purple-100 text-purple-700",
};
