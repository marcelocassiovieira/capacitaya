from app.modules.learning_paths.schemas import (
    ExerciseType,
    GapReport,
    GapSkill,
    GeneratedExercise,
    GeneratedModule,
    GeneratedPlan,
    GeneratedUnit,
    LearningPhase,
    SkillStatus,
)


_PRIORITY_WEIGHT = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


class MockPlanGenerator:
    def generate(self, gap_report: GapReport) -> GeneratedPlan:
        skills_to_train = [s for s in gap_report.skills if s.status != SkillStatus.READY]
        skills_to_train.sort(key=lambda s: _PRIORITY_WEIGHT[s.priority.value])

        modules = [
            self._build_module(idx, skill, gap_report)
            for idx, skill in enumerate(skills_to_train)
        ]

        total_minutes = sum(u.estimated_minutes for m in modules for u in m.units)

        return GeneratedPlan(
            student_email=gap_report.student.email,
            company_name=gap_report.company.name,
            target_role_title=gap_report.target_role.title,
            modules=modules,
            estimated_total_hours=round(total_minutes / 60, 2),
            generator_used="mock",
        )

    def _build_module(self, order: int, skill: GapSkill, gap_report: GapReport) -> GeneratedModule:
        return GeneratedModule(
            skill_name=skill.name,
            priority=skill.priority,
            order_index=order,
            units=[
                self._pasion_unit(skill, gap_report),
                self._play_unit(skill),
                self._practica_unit(skill),
            ],
        )

    def _pasion_unit(self, skill: GapSkill, gap_report: GapReport) -> GeneratedUnit:
        interests = ", ".join(gap_report.student.interests) or "tus intereses"
        company = gap_report.company.name
        role = gap_report.target_role.title
        return GeneratedUnit(
            phase=LearningPhase.PASION,
            title=f"Por que vas a usar {skill.name} en {company}",
            content=(
                f"En {company}, como {role}, vas a usar {skill.name} todos los dias. "
                f"Vamos a aprenderlo conectandolo con {interests}."
            ),
            estimated_minutes=10,
            exercises=[],
        )

    def _play_unit(self, skill: GapSkill) -> GeneratedUnit:
        return GeneratedUnit(
            phase=LearningPhase.PLAY,
            title=f"Sandbox de {skill.name}",
            content=(
                f"Explora {skill.name} sin miedo a equivocarte. "
                f"Este es un entorno seguro donde el error es parte del aprendizaje."
            ),
            estimated_minutes=15,
            exercises=[],
        )

    def _practica_unit(self, skill: GapSkill) -> GeneratedUnit:
        return GeneratedUnit(
            phase=LearningPhase.PRACTICA,
            title=f"Practica de {skill.name}",
            content=(
                f"Ahora aplicas {skill.name} en ejercicios reales. "
                f"Necesitas dominar al menos el 80 por ciento para avanzar."
            ),
            estimated_minutes=30,
            exercises=[
                GeneratedExercise(
                    prompt=f"Ejercicio mock 1 de {skill.name}",
                    type=ExerciseType.TEXT,
                    expected_answer="respuesta de ejemplo",
                    difficulty=min(skill.required_level, 5) or 1,
                ),
                GeneratedExercise(
                    prompt=f"Ejercicio mock 2 de {skill.name}",
                    type=ExerciseType.MULTIPLE_CHOICE,
                    expected_answer="opcion correcta",
                    difficulty=min(skill.required_level, 5) or 1,
                ),
            ],
        )
