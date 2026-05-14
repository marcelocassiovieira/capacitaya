# Cobertura del modelo 5P en el sistema

Documento de referencia que mapea las cinco "P" del modelo pedagógico de Capacity AR a piezas concretas del backend, indicando qué está implementado, dónde, y dónde irá lo que falta.

## Resumen

El modelo de las 5 P, según los documentos del proyecto, se divide en **dos grupos**:

1. **P que generan contenido del plan** — son unidades dentro de cada módulo. Hoy las cubre el `PlanGenerator`.
2. **P que operan transversalmente** durante el uso del plan — son comportamientos del sistema en runtime, no estructura del plan generado.

Esta distinción está explícita en los documentos del modelo:

> *"Paciencia y Perseverancia operan transversalmente (no son fases separadas)."*
>
> — `docs/training-module-design.md`

## Mapa de cobertura

| P | Tipo | Estado | Dónde vive en el código |
|---|---|---|---|
| **Pasión** | Contenido del plan | ✅ Implementada | `app/modules/learning_paths/plan_generator/prompts.py` (fase `pasion`) |
| **Play** | Contenido del plan | ✅ Implementada | `app/modules/learning_paths/plan_generator/prompts.py` (fase `play`) |
| **Práctica** | Contenido del plan | ✅ Implementada | `app/modules/learning_paths/plan_generator/prompts.py` (fase `practica`) |
| **Paciencia** | Transversal en runtime | ✅ Implementada | `app/modules/attempts/feedback.py` (feedback empático al fallar un ejercicio) |
| **Perseverancia** | Transversal en runtime | ⚠️ Pendiente | Vivirá en `app/modules/student_metrics/` + `app/modules/alerts/` |

## Detalle de cada P

### Pasión — implementada

**Qué hace:** anclaje motivacional. Conecta cada skill que se va a aprender con la empresa objetivo, el rol y los intereses personales del estudiante.

**Dónde:** primera unit de cada módulo generado, prompt específico en `prompts.py`:

> *"Conecta la habilidad con la empresa y el rol elegidos, usando los intereses del estudiante para que sienta por qué vale la pena aprender esto."*

**Verificable en producción:** ver `modules[*].units[0].content` de cualquier plan generado. Debe mencionar al estudiante por nombre, los intereses declarados, y la empresa elegida.

### Play — implementada

**Qué hace:** exploración sin penalización, presenta la habilidad como un sandbox donde el error es bienvenido.

**Dónde:** segunda unit de cada módulo, prompt en `prompts.py`:

> *"Presenta la habilidad como un sandbox donde el error es bienvenido. Da un mini-ejemplo concreto que el estudiante pueda imaginar o ejecutar mentalmente."*

**Verificable:** `modules[*].units[1].content` debe tener tono lúdico, invitar a experimentar, sin ejercicios formales (`exercises: []`).

### Práctica — implementada

**Qué hace:** aplicación activa con ejercicios adaptativos. Umbral de dominio del 80%.

**Dónde:** tercera unit de cada módulo, con 5 ejercicios multiple choice generados por Gemini.

**Verificable:** `modules[*].units[2].exercises` debe tener 5 elementos, cada uno con `type: "multiple_choice"`, opciones A/B/C/D embebidas en el `prompt`, y `expected_answer` con una sola letra.

### Paciencia — implementada, transversal

**Qué hace:** responde con mensajes empáticos que normalizan el error cuando el alumno falla un ejercicio. Activa la 4° P del modelo 5P de forma contextualizada.

**Dónde está:** [app/modules/attempts/feedback.py](../app/modules/attempts/feedback.py).

**Cómo funciona:**

1. Cada `POST /attempts` evalúa la respuesta del alumno.
2. Si `is_correct=False`, se invoca al LLM (Groq o Gemini según `PLAN_GENERATOR`) con un prompt que pide:
   - Tono cercano, español rioplatense, segunda persona.
   - Normalizar el error sin condescendencia.
   - NO revelar la respuesta esperada.
   - Ofrecer una pista conceptual y motivar a intentar de nuevo.
   - Máximo 60 palabras.
3. El mensaje queda persistido en el campo `ai_feedback` del attempt.
4. Si el LLM falla (cuota, timeout), se devuelve un mensaje estático de respaldo para que el endpoint nunca rompa.

**Lo que aún no está:**

- Detección de lenguaje agresivo por NLP (alerta `ANOMALY_PATIENCE`). Va en el módulo `alerts/`.
- Análisis de patrones agregados de frustración (varios fallos seguidos en distintas skills). También en `alerts/`.

### Perseverancia — pendiente, transversal

**Qué hace:** visualizar progreso del estudiante a través de micro-logros, streaks, hitos visibles. Reduce el riesgo de deserción.

**Por qué no está en el plan generado:** tampoco es contenido educativo, es una **vista de seguimiento** que se calcula sobre los attempts y sessions del estudiante.

**Dónde irá:**

1. `app/modules/student_metrics/` — endpoint `GET /students/{email}/progress` que devuelve métricas motivacionales:
   - "Vas por el 40% del path"
   - "Dominaste Git, te faltan SQL y HTTP APIs"
   - "7 días seguidos aprendiendo"
   - "Te faltan 3 ejercicios para dominar SQL"

   Importante: el estudiante **no ve el `readiness_score` numérico crudo** (decisión documentada en `access-matrix.md`).

2. `app/modules/alerts/` — disparar `LOW_PERSEVERANCE` cuando hay 5 intentos fallidos seguidos en el mismo ejercicio, o `ABANDON_RISK` cuando hay 72h+ sin actividad.

## Por qué la distinción importa

Si un revisor pregunta *"¿el sistema implementa las 5 P?"*, la respuesta correcta tiene dos partes:

1. **El plan generado** implementa las 3 P de contenido (Pasión, Play, Práctica). Verificable inspeccionando cualquier respuesta de `POST /learning-paths`.

2. **El sistema de uso del plan** implementará las 2 P transversales (Paciencia, Perseverancia) en módulos específicos (`attempts`, `student_metrics`, `alerts`) cuando se cierre el ciclo pedagógico completo. Hoy esas piezas existen como **diseño detallado** en `docs/training-module-design.md` pero no como código.

Esto **no es una omisión arquitectónica**. Los propios documentos del modelo separan los dos grupos. Implementar Paciencia o Perseverancia como units en el `PlanGenerator` sería tergiversar el modelo: serían mensajes genéricos en lugar de respuestas contextualizadas al estado emocional real del estudiante en cada momento.

## Roadmap para cerrar el modelo completo

| Hito | Módulo a implementar | P que aparece | Estado |
|---|---|---|---|
| 1 | `attempts` (registrar intentos, feedback con LLM) | Paciencia (mensaje empático ante error) | ✅ Implementado |
| 2 | `sessions` (tracking de actividad) | Insumo para perseverancia | ⚠️ Pendiente |
| 3 | `student_metrics` (vista motivacional) | Perseverancia (progreso visible) | ⚠️ Pendiente |
| 4 | `alerts` (LOW_PERSEVERANCE, ANOMALY_PATIENCE, etc.) | Refuerzo de ambas P + capa de tutor | ⚠️ Pendiente |

Ver `docs/training-module-design.md` para el diseño técnico detallado de cada uno.
