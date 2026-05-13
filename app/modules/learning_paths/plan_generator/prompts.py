from app.modules.learning_paths.schemas import GapReport, GapSkill, LearningPhase


_PHASE_INSTRUCTIONS = {
    LearningPhase.PASION: (
        "Esta unidad es de fase PASION: anclaje motivacional. "
        "Conecta la habilidad con la empresa y el rol elegidos, usando los intereses "
        "del estudiante para que sienta por que vale la pena aprender esto. "
        "No expliques la habilidad todavia, solo motiva. "
        "Sin ejercicios (deja exercises como lista vacia). "
        "Tono: cercano, en segunda persona, en espanol rioplatense."
    ),
    LearningPhase.PLAY: (
        "Esta unidad es de fase PLAY: exploracion sin penalizacion. "
        "Presenta la habilidad como un sandbox donde el error es bienvenido. "
        "Da un mini-ejemplo concreto que el estudiante pueda imaginar o ejecutar mentalmente. "
        "Sin ejercicios formales (deja exercises como lista vacia). "
        "Tono: ludico, invitando a experimentar."
    ),
    LearningPhase.PRACTICA: (
        "Esta unidad es de fase PRACTICA: aplicacion activa. "
        "Explica los conceptos clave necesarios para resolver problemas reales con esta habilidad. "
        "Incluye EXACTAMENTE 5 ejercicios formativos, todos de tipo multiple_choice "
        "(no uses text ni code), pensados para alcanzar dominio del 80%. "
        "Para cada ejercicio:\n"
        "- El campo 'prompt' debe contener la pregunta seguida de las 4 opciones en formato:\n"
        "  '<pregunta>\\nA) <opcion 1>\\nB) <opcion 2>\\nC) <opcion 3>\\nD) <opcion 4>'\n"
        "- El campo 'type' debe ser exactamente 'multiple_choice'.\n"
        "- El campo 'expected_answer' debe ser una sola letra: 'A', 'B', 'C' o 'D'.\n"
        "- El campo 'difficulty' debe ser un entero entre 1 y 5, escalando desde el "
        "ejercicio 1 (mas facil) al 5 (mas dificil), alineado al required_level.\n"
        "Las opciones deben ser plausibles, no triviales. La opcion correcta no siempre debe "
        "ser la B; varia la letra correcta entre ejercicios. Tono: tecnico pero accesible."
    ),
}


def build_unit_prompt(
    skill: GapSkill, phase: LearningPhase, gap_report: GapReport
) -> str:
    interests = ", ".join(gap_report.student.interests) or "sus intereses"
    return f"""Generas contenido educativo para una plataforma argentina de capacitacion IT
que ayuda a jovenes de barrios vulnerables a insertarse laboralmente.

Datos del estudiante:
- Nombre: {gap_report.student.name}
- Intereses: {interests}
- Empresa objetivo: {gap_report.company.name}
- Rol objetivo: {gap_report.target_role.title}

Habilidad a trabajar en esta unidad:
- Nombre: {skill.name}
- Nivel actual del estudiante: {skill.current_level}/5
- Nivel requerido por el puesto: {skill.required_level}/5
- Brecha: {skill.gap_level}
- Prioridad: {skill.priority.value}

{_PHASE_INSTRUCTIONS[phase]}

Devolve un JSON valido que cumpla el schema indicado. Las claves del JSON van en ingles
(phase, title, content, estimated_minutes, exercises), pero el texto generado debe estar en espanol.
El valor de "phase" debe ser exactamente "{phase.value}".
"""
