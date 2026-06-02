// ─── Tipos base ───────────────────────────────────────────────────────────────

export type UserRole = "student" | "tutor" | "company_admin" | "admin";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
}

// ─── Learning Paths ───────────────────────────────────────────────────────────

export type LearningPhase = "pasion" | "play" | "practica";
export type ExerciseType = "multiple_choice" | "text" | "code";
export type SkillPriority = "HIGH" | "MEDIUM" | "LOW";
export type SkillStatus = "READY" | "NEEDS_WORK" | "MISSING";
export type PathStatus = "ACTIVE" | "COMPLETED" | "ABANDONED";

export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface Exercise {
  prompt: string;
  type: ExerciseType;
  expected_answer: string;
  difficulty: number;
}

export interface Unit {
  phase: LearningPhase;
  title: string;
  content: string;
  estimated_minutes: number;
  exercises: Exercise[];
  resources: Resource[];
}

export interface Module {
  skill_name: string;
  priority: SkillPriority;
  order_index: number;
  units: Unit[];
}

export interface LearningPath {
  id: number;
  student_email: string;
  student_name: string;
  company_name: string;
  target_role_title: string;
  gap_analysis_id: number | null;
  readiness_score_initial: number;
  estimated_total_hours: number;
  generator_used: string;
  status: PathStatus;
  modules: Module[];
  created_at: string;
  updated_at: string;
}

// ─── Attempts ────────────────────────────────────────────────────────────────

export interface AttemptCreate {
  student_email: string;
  learning_path_id: number;
  module_index: number;
  unit_index: number;
  exercise_index: number;
  answer: string;
  time_spent_seconds?: number;
}

export interface Attempt {
  id: number;
  student_email: string;
  learning_path_id: number;
  module_index: number;
  unit_index: number;
  exercise_index: number;
  skill_name: string;
  answer: string;
  expected_answer: string;
  is_correct: boolean;
  score: number;
  ai_feedback: string;
  skill_mastery: number;
  mastery_threshold_reached: boolean;
  created_at: string;
}


// ─── Fetch helper ────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${detail}`);
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = {
  list: (params?: { offset?: number; limit?: number; role?: UserRole }) => {
    const entries = Object.entries(params ?? {}).filter(([, v]) => v !== undefined);
    const qs = new URLSearchParams(entries as [string, string][]).toString();
    return request<User[]>(`/users${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<User>(`/users/${id}`),
  create: (data: UserCreate) =>
    request<User>("/users", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Learning Paths ───────────────────────────────────────────────────────────

export const learningPaths = {
  list: (params?: { offset?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<LearningPath[]>(`/learning-paths${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<LearningPath>(`/learning-paths/${id}`),
  getByStudent: (email: string) =>
    request<LearningPath[]>(`/students/${encodeURIComponent(email)}/learning-paths`),
};

// ─── Attempts ────────────────────────────────────────────────────────────────

export const attempts = {
  create: (data: AttemptCreate) =>
    request<Attempt>("/attempts", { method: "POST", body: JSON.stringify(data) }),
  get: (id: number) => request<Attempt>(`/attempts/${id}`),
  getByStudent: (email: string, params?: { offset?: number; limit?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Attempt[]>(
      `/students/${encodeURIComponent(email)}/attempts${qs ? `?${qs}` : ""}`,
    );
  },
};

// ─── Skills ──────────────────────────────────────────────────────────────────

export interface Skill {
  id: number;
  name: string;
}

export const skills = {
  search: (q: string) =>
    request<Skill[]>(`/skills?q=${encodeURIComponent(q)}`),
  create: (name: string) =>
    request<Skill>("/skills", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
};

// ─── Job Descriptions ─────────────────────────────────────────────────────────

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "PRO";

export interface SkillRequirement {
  skill_id: number;
  skill_name: string;
  level: SkillLevel;
}

export interface PostedBy {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface JobDescription {
  id: number;
  title: string;
  description: string;
  province: string;
  posted_by: PostedBy;
  required_skills: SkillRequirement[];
  created_at: string;
}

export interface JobDescriptionCreate {
  user_id: number;
  title: string;
  description: string;
  province: string;
  required_skills: { skill_id: number; level: SkillLevel }[];
}

export const jobDescriptions = {
  list: (province?: string) =>
    request<JobDescription[]>(
      `/job-descriptions${province ? `?province=${encodeURIComponent(province)}` : ""}`,
    ),
  create: (data: JobDescriptionCreate) =>
    request<JobDescription>("/job-descriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/job-descriptions/${id}`, { method: "DELETE" }),
};

// ─── Gap Analyses ─────────────────────────────────────────────────────────────

export interface GapSkill {
  name: string;
  current_level: number;
  required_level: number;
  gap_level: number;
  priority: SkillPriority;
  status: SkillStatus;
}

export interface GapReportData {
  id: number | null;
  summary: string;
  readiness_score: number;
  skills: GapSkill[];
}

export interface GapAnalysis {
  id: number;
  student_email: string;
  company_email: string;
  readiness_score: number;
  summary: string;
  gap_report: GapReportData;
  learning_path_id: number | null;
  generator_used: string;
  created_at: string;
}

export interface GapAnalysisCreate {
  student_email: string;
  job_description_id: number;
}

export interface GapAnalysisWithPlan {
  gap_analysis: GapAnalysis;
  learning_path: LearningPath;
}

export const gapAnalyses = {
  create: (data: GapAnalysisCreate) =>
    request<GapAnalysis>("/gap-analyses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  generateLearningPath: (email: string) =>
    request<GapAnalysisWithPlan>(
      `/students/${encodeURIComponent(email)}/generate-learning-path`,
      { method: "POST" },
    ),
};

// ─── User Skills ──────────────────────────────────────────────────────────────

export interface UserSkill {
  id: number;
  skill_id: number;
  skill_name: string;
  level: SkillLevel;
  created_at: string;
}

export interface UserSkillCreate {
  skill_id: number;
  level: SkillLevel;
}

export const userSkills = {
  list: (email: string) =>
    request<UserSkill[]>(`/students/${encodeURIComponent(email)}/skills`),
  add: (email: string, data: UserSkillCreate) =>
    request<UserSkill>(`/students/${encodeURIComponent(email)}/skills`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  remove: (email: string, skillId: number) =>
    request<void>(`/students/${encodeURIComponent(email)}/skills/${skillId}`, {
      method: "DELETE",
    }),
};