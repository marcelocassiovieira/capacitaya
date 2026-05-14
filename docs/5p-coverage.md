# Cobertura del modelo 5P

Mapea las cinco "P" del modelo pedagógico de Capacity AR a piezas concretas del backend.

Los documentos del modelo dividen las P en dos grupos:

- **3 P que generan contenido del plan** — son unidades del plan generado.
- **2 P transversales en runtime** — son comportamientos del sistema durante el uso del plan, no fases del plan.

Cita textual de `docs/training-module-design.md`:

> *"Paciencia y Perseverancia operan transversalmente (no son fases separadas)."*

## Mapa

| P | Tipo | Estado | Dónde |
|---|---|---|---|
| Pasión | Contenido del plan | ✅ Implementada | `learning_paths/plan_generator/prompts.py` (fase `pasion`) |
| Play | Contenido del plan | ✅ Implementada | `prompts.py` (fase `play`) |
| Práctica | Contenido del plan | ✅ Implementada | `prompts.py` (fase `practica`) |
| Paciencia | Transversal | ✅ Implementada | `attempts/feedback.py` (feedback empático al fallar) |
| Perseverancia | Transversal | ⚠️ Pendiente | irá en `student_metrics/` + `alerts/` |

## Cómo verificar en producción

- **Pasión**: `modules[*].units[0].content` de cualquier plan generado menciona el nombre del estudiante, sus intereses y la empresa objetivo.
- **Play**: `modules[*].units[1].content` con tono lúdico e invitación a experimentar. `exercises: []`.
- **Práctica**: `modules[*].units[2].exercises` con 5 multiple_choice (A/B/C/D, `expected_answer` letra).
- **Paciencia**: `POST /attempts` con respuesta incorrecta devuelve `ai_feedback` con mensaje empático que **no revela la respuesta correcta**.
- **Perseverancia**: aún no expuesta. Cuando esté `GET /students/{email}/progress`, ahí va.

## Lo que falta de Paciencia y Perseverancia

- **Detección de patrones agregados de frustración** (varios fallos seguidos, lenguaje agresivo): módulo `alerts/` (no implementado).
- **Visualización del progreso del alumno** (% completado, streak, hitos): módulo `student_metrics/` (no implementado).
- Diseño detallado de ambos en `training-module-design.md`.
