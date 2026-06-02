import logging

from fastapi import HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.modules.gap_analysis import extractors, repository
from app.modules.gap_analysis.extractors import (
    DocumentTooLargeError,
    EmptyDocumentError,
    UnsupportedDocumentError,
)
from app.modules.gap_analysis.models import GapAnalysis
from app.modules.gap_analysis.schemas import (
    GapAnalysisInputs,
    GapAnalysisResponse,
    GapAnalysisWithPlanResponse,
)
from app.modules.learning_paths import service as lp_service
from app.modules.learning_paths.plan_generator.base import PlanGenerator
from app.modules.learning_paths.repository.base import LearningPathRepository
from app.modules.learning_paths.schemas import (
    CompanyInput,
    GapReport,
    GapSkill,
    RequiredSkill,
    SkillPriority,
    SkillStatus,
    StudentInput,
    StudentSkill,
    TargetRoleInput,
)
from app.modules.job_descriptions import repository as jd_repository
from app.modules.job_descriptions.models import JobDescription
from app.modules.user_skills import repository as us_repository
from app.modules.users import repository as users_repository
from app.shared.llm import GroqClient, LlmConfigurationError, LlmResponseError


logger = logging.getLogger(__name__)

_LEVEL_INT: dict[str, int] = {
    "BEGINNER": 1,
    "INTERMEDIATE": 2,
    "ADVANCED": 3,
    "PRO": 4,
}

_PRIORITY_WEIGHT: dict[str, int] = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}


_GAP_REPORT_SCHEMA: dict = {
    "type": "object",
    "properties": {
        "student": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "skills": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "level": {"type": "integer"},
                        },
                        "required": ["name", "level"],
                    },
                },
                "interests": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["name", "skills", "interests"],
        },
        "company": {
            "type": "object",
            "properties": {"name": {"type": "string"}},
            "required": ["name"],
        },
        "target_role": {
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "required_skills": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "level": {"type": "integer"},
                            "priority": {
                                "type": "string",
                                "enum": ["HIGH", "MEDIUM", "LOW"],
                            },
                        },
                        "required": ["name", "level", "priority"],
                    },
                },
            },
            "required": ["title", "required_skills"],
        },
        "summary": {"type": "string"},
        "readiness_score": {"type": "integer"},
        "skills": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "current_level": {"type": "integer"},
                    "required_level": {"type": "integer"},
                    "gap_level": {"type": "integer"},
                    "priority": {
                        "type": "string",
                        "enum": ["HIGH", "MEDIUM", "LOW"],
                    },
                    "status": {
                        "type": "string",
                        "enum": ["READY", "NEEDS_WORK", "MISSING"],
                    },
                },
                "required": [
                    "name",
                    "current_level",
                    "required_level",
                    "gap_level",
                    "priority",
                    "status",
                ],
            },
        },
    },
    "required": [
        "student",
        "company",
        "target_role",
        "summary",
        "readiness_score",
        "skills",
    ],
}


def create_gap_analysis(
    db: Session,
    student_email: str,
    company_email: str,
    student_doc: UploadFile,
    position_doc: UploadFile,
) -> GapAnalysisResponse:
    """Step 1: extract GapReport from docs and persist it. Does NOT trigger
    learning_path generation (use generate_learning_path_for_student for that)."""
    inputs = _validate_inputs(student_email, company_email)
    student_text = _extract_or_fail(student_doc, "student_doc")
    position_text = _extract_or_fail(position_doc, "position_doc")

    gap_report = _groq_extract_gap_report(
        student_text=student_text,
        position_text=position_text,
        student_email=inputs.student_email,
    )

    stored = repository.save(
        db,
        GapAnalysis(
            student_email=inputs.student_email,
            company_email=inputs.company_email,
            readiness_score=gap_report.readiness_score,
            summary=gap_report.summary,
            gap_report_json=gap_report.model_dump_json(),
            student_doc_text=student_text,
            position_doc_text=position_text,
            learning_path_id=None,
            generator_used="groq",
        ),
    )

    return _to_response(stored, gap_report)


def create_gap_analysis_from_skills(
    db: Session,
    student_email: str,
    job_description_id: int,
) -> GapAnalysisResponse:
    student = users_repository.find_by_email(db, student_email)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado.")

    jd = jd_repository.find_by_id(db, job_description_id)
    if jd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Puesto no encontrado.")

    jd_skills = jd_repository.find_skills_for_jd(db, job_description_id)
    if not jd_skills:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El puesto no tiene habilidades requeridas.",
        )

    student_skill_rows = us_repository.find_by_user(db, student.id)

    company_user = users_repository.find_by_id(db, jd.user_id)
    company_name = (
        f"{company_user.first_name} {company_user.last_name}" if company_user else "Empresa"
    )
    company_email = company_user.email if company_user else ""

    gap_report = _build_gap_report(
        student=student,
        student_skill_rows=student_skill_rows,
        jd=jd,
        jd_skills=jd_skills,
        company_name=company_name,
    )

    stored = repository.save(
        db,
        GapAnalysis(
            student_email=student.email,
            company_email=company_email,
            readiness_score=gap_report.readiness_score,
            summary=gap_report.summary,
            gap_report_json=gap_report.model_dump_json(),
            student_doc_text="",
            position_doc_text="",
            learning_path_id=None,
            generator_used="skills",
        ),
    )

    return _to_response(stored, gap_report)


def _build_gap_report(
    student,
    student_skill_rows: list,
    jd: JobDescription,
    jd_skills: list,
    company_name: str,
) -> GapReport:
    student_skills_dict: dict[str, int] = {
        name.lower(): _LEVEL_INT[us.level.value]
        for us, name in student_skill_rows
    }

    gap_skills: list[GapSkill] = []
    required_skills_for_role: list[RequiredSkill] = []

    for _skill_id, skill_name, jd_level in jd_skills:
        required_num = _LEVEL_INT[jd_level.value]
        current_num = student_skills_dict.get(skill_name.lower(), 0)
        gap = required_num - current_num

        if gap <= 0:
            skill_status = SkillStatus.READY
            skill_priority = SkillPriority.LOW
        elif gap == 1:
            skill_status = SkillStatus.NEEDS_WORK
            skill_priority = SkillPriority.MEDIUM
        else:
            skill_status = SkillStatus.MISSING
            skill_priority = SkillPriority.HIGH

        gap_skills.append(GapSkill(
            name=skill_name,
            current_level=min(current_num, 5),
            required_level=required_num,
            gap_level=gap,
            priority=skill_priority,
            status=skill_status,
        ))
        required_skills_for_role.append(RequiredSkill(
            name=skill_name,
            level=required_num,
            priority=skill_priority,
        ))

    total_weight = sum(_PRIORITY_WEIGHT[gs.priority.value] for gs in gap_skills)
    if total_weight == 0:
        readiness_score = 100
    else:
        weighted_sum = sum(
            _PRIORITY_WEIGHT[gs.priority.value] * (
                min(gs.current_level, gs.required_level) / gs.required_level
                if gs.required_level > 0 else 1.0
            )
            for gs in gap_skills
        )
        readiness_score = round(weighted_sum / total_weight * 100)

    n_gaps = sum(1 for gs in gap_skills if gs.status != SkillStatus.READY)
    student_name = f"{student.first_name} {student.last_name}"
    if n_gaps == 0:
        summary = f"{student_name} cumple con el perfil requerido para {jd.title}."
    elif n_gaps == 1:
        summary = f"A {student_name} le falta 1 habilidad para alcanzar el perfil de {jd.title}."
    else:
        summary = f"A {student_name} le faltan {n_gaps} habilidades para alcanzar el perfil de {jd.title}."

    return GapReport(
        student=StudentInput(
            name=student_name,
            email=student.email,
            skills=[
                StudentSkill(name=name, level=_LEVEL_INT[us.level.value])
                for us, name in student_skill_rows
            ],
            interests=[],
        ),
        company=CompanyInput(name=company_name),
        target_role=TargetRoleInput(
            title=jd.title,
            required_skills=required_skills_for_role,
        ),
        summary=summary,
        readiness_score=readiness_score,
        skills=gap_skills,
    )


def generate_learning_path_for_student(
    db: Session,
    student_email: str,
    plan_generator: PlanGenerator,
    lp_repository: LearningPathRepository,
) -> GapAnalysisWithPlanResponse:
    """Step 2: take the latest pending gap_analysis for a student and
    trigger learning_paths.create_learning_path with its stored GapReport."""
    stored = repository.find_latest_without_plan_by_student(db, student_email)
    if stored is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No hay gap_analysis pendiente para '{student_email}'. "
                "Suba primero los documentos en POST /api/gap-analyses."
            ),
        )

    gap_report = GapReport.model_validate_json(stored.gap_report_json)
    learning_path = lp_service.create_learning_path(
        plan_generator, lp_repository, gap_report, db
    )

    stored.learning_path_id = learning_path.id
    db.commit()
    db.refresh(stored)

    return GapAnalysisWithPlanResponse(
        gap_analysis=_to_response(stored, gap_report),
        learning_path=learning_path,
    )


def get_gap_analysis(db: Session, gap_id: int) -> GapAnalysisResponse:
    stored = repository.find_by_id(db, gap_id)
    if stored is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Gap analysis no encontrado."
        )
    return _to_response(stored)


def list_by_student(
    db: Session, email: str, offset: int = 0, limit: int = 100
) -> list[GapAnalysisResponse]:
    return [
        _to_response(item)
        for item in repository.find_by_student(db, email, offset=offset, limit=limit)
    ]


def _validate_inputs(student_email: str, company_email: str) -> GapAnalysisInputs:
    try:
        return GapAnalysisInputs(
            student_email=student_email, company_email=company_email
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        ) from exc


def _extract_or_fail(upload: UploadFile, field_name: str) -> str:
    try:
        return extractors.extract_text(upload)
    except UnsupportedDocumentError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name}: {exc}",
        ) from exc
    except DocumentTooLargeError as exc:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"{field_name}: {exc}",
        ) from exc
    except EmptyDocumentError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field_name}: {exc}",
        ) from exc


def _groq_extract_gap_report(
    student_text: str, position_text: str, student_email: str
) -> GapReport:
    try:
        client = GroqClient()
    except LlmConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GROQ_API_KEY no configurada en el servidor.",
        ) from exc

    prompt = _build_extraction_prompt(student_text, position_text)
    try:
        raw = client.generate_json(prompt, _GAP_REPORT_SCHEMA, temperature=0.3)
    except LlmResponseError as exc:
        logger.exception("Groq fallo al extraer GapReport: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq no pudo extraer el GapReport: {exc}",
        ) from exc

    raw = _enrich_with_email(raw, student_email)

    try:
        return GapReport.model_validate(raw)
    except ValidationError as exc:
        logger.warning("Groq devolvio un GapReport invalido: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "message": "El JSON devuelto por Groq no cumple el schema de GapReport.",
                "errors": exc.errors(),
                "raw_response": raw,
            },
        ) from exc


def _enrich_with_email(raw: dict, student_email: str) -> dict:
    """Email del estudiante viene como form field, no se le pide al LLM."""
    student = raw.get("student") or {}
    student["email"] = student_email
    if not student.get("name"):
        student["name"] = student_email.split("@")[0]
    raw["student"] = student
    return raw


def _build_extraction_prompt(student_text: str, position_text: str) -> str:
    return f"""Sos un analista de RRHH en una plataforma argentina de capacitacion IT
para jovenes de barrios vulnerables. Tu tarea es leer dos textos (datos crudos del
estudiante y datos crudos de la oferta laboral) y producir un GapReport estructurado
que despues un motor pedagogico va a usar para generar un plan de aprendizaje.

INSTRUCCIONES DE ANALISIS:

1. Inferi del texto del estudiante:
   - Su nombre completo (si no aparece, dejalo vacio).
   - Las skills que conoce, asignando un nivel del 0 al 5 segun cuanto las domina:
     0 = no las conoce, 1 = basico, 2 = inicial operativo, 3 = junior, 4 = intermedio, 5 = avanzado.
   - Sus intereses personales (videojuegos, deportes, musica, etc.).

2. Inferi del texto de la oferta:
   - Nombre de la empresa.
   - Titulo del rol.
   - Las skills requeridas con su nivel pedido (0-5) y su prioridad (HIGH | MEDIUM | LOW).
     Si no se aclara la prioridad, usa HIGH para skills core, MEDIUM para nice-to-have, LOW para opcionales.

3. Calcula para cada skill requerida del rol:
   - current_level = nivel del estudiante en esa skill (0 si no la declaro).
   - required_level = nivel pedido por la empresa.
   - gap_level = required_level - current_level.
   - status:
       READY      si gap_level <= 0
       NEEDS_WORK si gap_level == 1
       MISSING    si gap_level >= 2

4. readiness_score (0-100): promedio ponderado por prioridad (HIGH=3, MEDIUM=2, LOW=1)
   de min(current_level, required_level) / required_level, multiplicado por 100 y redondeado.

5. summary: una sola frase en espanol rioplatense que describa que le falta al estudiante
   para acercarse al puesto, mencionando empresa y rol.

TEXTO DEL ESTUDIANTE:
\"\"\"
{student_text}
\"\"\"

TEXTO DE LA OFERTA:
\"\"\"
{position_text}
\"\"\"

Devolve UNICAMENTE el JSON segun el schema indicado. Las claves van en ingles, los
strings de contenido (name, summary, interests, etc.) van en espanol.
"""


def _to_response(
    stored: GapAnalysis, gap_report: GapReport | None = None
) -> GapAnalysisResponse:
    if gap_report is None:
        gap_report = GapReport.model_validate_json(stored.gap_report_json)
    return GapAnalysisResponse(
        id=stored.id,
        student_email=stored.student_email,
        company_email=stored.company_email,
        readiness_score=stored.readiness_score,
        summary=stored.summary,
        gap_report=gap_report,
        learning_path_id=stored.learning_path_id,
        generator_used=stored.generator_used,
        created_at=stored.created_at,
    )
