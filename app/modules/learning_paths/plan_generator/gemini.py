import logging
from concurrent.futures import ThreadPoolExecutor

from pydantic import ValidationError

from app.modules.learning_paths.plan_generator.prompts import build_unit_prompt
from app.modules.learning_paths.schemas import (
    GapReport,
    GapSkill,
    GeneratedModule,
    GeneratedPlan,
    GeneratedUnit,
    LearningPhase,
    SkillStatus,
)
from app.shared.llm import GeminiClient


logger = logging.getLogger(__name__)

_PRIORITY_WEIGHT = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
_UNIT_PHASES = (LearningPhase.PASION, LearningPhase.PLAY, LearningPhase.PRACTICA)
_PHASE_MINUTES = {
    LearningPhase.PASION: 10,
    LearningPhase.PLAY: 15,
    LearningPhase.PRACTICA: 30,
}
_MAX_PARALLEL_CALLS = 5

# Gemini's structured output expects an OpenAPI-style schema without $defs/$ref,
# so we declare it explicitly instead of leaning on Pydantic's json_schema().
_UNIT_RESPONSE_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "phase": {"type": "string", "enum": ["pasion", "play", "practica"]},
        "title": {"type": "string"},
        "content": {"type": "string"},
        "estimated_minutes": {"type": "integer"},
        "exercises": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "prompt": {"type": "string"},
                    "type": {
                        "type": "string",
                        "enum": ["multiple_choice", "text", "code"],
                    },
                    "expected_answer": {"type": "string"},
                    "difficulty": {"type": "integer"},
                },
                "required": ["prompt", "type", "expected_answer", "difficulty"],
            },
        },
    },
    "required": ["phase", "title", "content", "estimated_minutes", "exercises"],
}


class GeminiPlanGenerator:
    def __init__(self, client: GeminiClient | None = None) -> None:
        self._client = client or GeminiClient()

    def generate(self, gap_report: GapReport) -> GeneratedPlan:
        skills_to_train = sorted(
            (s for s in gap_report.skills if s.status != SkillStatus.READY),
            key=lambda s: _PRIORITY_WEIGHT[s.priority.value],
        )

        unit_jobs = [
            (skill_index, skill, phase)
            for skill_index, skill in enumerate(skills_to_train)
            for phase in _UNIT_PHASES
        ]

        with ThreadPoolExecutor(max_workers=_MAX_PARALLEL_CALLS) as executor:
            generated_units = list(
                executor.map(
                    lambda job: self._generate_unit(job[1], job[2], gap_report),
                    unit_jobs,
                )
            )

        modules: list[GeneratedModule] = []
        for skill_index, skill in enumerate(skills_to_train):
            units_for_skill = [
                generated_units[i]
                for i, job in enumerate(unit_jobs)
                if job[0] == skill_index
            ]
            modules.append(
                GeneratedModule(
                    skill_name=skill.name,
                    priority=skill.priority,
                    order_index=skill_index,
                    units=units_for_skill,
                )
            )

        total_minutes = sum(u.estimated_minutes for m in modules for u in m.units)

        return GeneratedPlan(
            student_email=gap_report.student.email,
            student_name=gap_report.student.name,
            company_name=gap_report.company.name,
            target_role_title=gap_report.target_role.title,
            gap_analysis_id=gap_report.id,
            readiness_score_initial=gap_report.readiness_score,
            modules=modules,
            estimated_total_hours=round(total_minutes / 60, 2),
            generator_used="gemini",
        )

    def _generate_unit(
        self, skill: GapSkill, phase: LearningPhase, gap_report: GapReport
    ) -> GeneratedUnit:
        prompt = build_unit_prompt(skill, phase, gap_report)
        raw = self._client.generate_json(prompt, _UNIT_RESPONSE_SCHEMA)
        raw.setdefault("phase", phase.value)
        raw.setdefault("estimated_minutes", _PHASE_MINUTES[phase])
        raw.setdefault("exercises", [])
        try:
            unit = GeneratedUnit.model_validate(raw)
        except ValidationError as exc:
            logger.warning(
                "Gemini returned an invalid unit for skill=%s phase=%s: %s",
                skill.name,
                phase.value,
                exc,
            )
            raise
        if unit.phase != phase:
            unit = unit.model_copy(update={"phase": phase})
        return unit
