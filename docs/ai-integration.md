# Integración con IA — Generación de Learning Paths

Documenta cómo el sistema integra IA generativa para producir el contenido de los planes de capacitación, qué decisiones se tomaron y qué partes son determinísticas vs. delegadas al modelo.

## Resumen ejecutivo

- **No entrenamos un modelo propio**, ni hicimos fine-tuning.
- Usamos un LLM **pre-entrenado de propósito general** vía API REST.
- **Dos proveedores soportados:** Groq (Llama 3.3 70B) y Google Gemini. El switch es una env var.
- La "inteligencia del dominio" vive en **nuestros prompts** y en una **estrategia híbrida** que mantiene la estructura del plan en código y delega solo la generación de contenido al LLM.
- El sistema tiene **fallback automático** a un generador mock si el LLM falla o se queda sin cuota, garantizando que la API nunca rompe por culpa de la IA.
- La IA se usa en **tres puntos** del sistema:
  1. Generación del contenido de cada unit (title + content + exercises).
  2. Sugerencia de recursos de estudio externos (videos, guías, sandboxes).
  3. Feedback empático cuando un alumno falla un ejercicio (Paciencia, 4° P del modelo 5P).

## Arquitectura

```
GapReport (Equipo 1)
        │
        ▼
┌───────────────────────────┐
│ POST /learning-paths      │
│ (router.py)               │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────┐
│ service.create_learning_path
│ (valida, orquesta)        │
└───────────┬───────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ get_plan_generator() — factory.py     │
│ Lee env var PLAN_GENERATOR:           │
│   mock   → MockPlanGenerator          │
│   groq   → GroqPlanGenerator          │
│   gemini → GeminiPlanGenerator        │
│            ambos envueltos en fallback│
└───────────┬───────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────┐
│ LlmBackedPlanGenerator (base abstracta)      │
│ 1. Arma estructura determinística            │
│    (módulos por skill, fases 5P fijas)       │
│ 2. Por cada unit: llamada al LLM con prompt  │
│ 3. Llamadas en PARALELO (ThreadPool)         │
│ 4. Si una falla → fallback automático a Mock │
└───────────┬──────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────┐
│ _enrich_with_resources (service)              │
│ Por cada (skill, phase) del plan:             │
│   - Lee resources existentes de la BD         │
│   - Si no hay: LLM sugiere → persiste         │
│ Embebe los resources dentro de cada unit      │
└───────────┬───────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ SqlAlchemyLearningPathRepository.save │
│ Persiste plan completo como JSON      │
│ en Postgres (Neon)                    │
└───────────────────────────────────────┘
```

Cuando el alumno responde un ejercicio, hay una cuarta integración:

```
POST /attempts
   ↓
service.create_attempt
   ↓
Evalúa respuesta (string match)
   ↓
feedback.generate_feedback
   ↓
Si is_correct=False → llamada al LLM
   Prompt: "sos un coach empático, no reveles la respuesta..."
   Tono: español rioplatense, segunda persona
   → ai_feedback embebido en el attempt
```

## Estrategia híbrida: qué hace el código y qué hace la IA

| Decisión | Quién la toma |
|---|---|
| Qué skills entran al plan (status != READY) | Código |
| Orden de los módulos (por priority HIGH > MEDIUM > LOW) | Código |
| Cantidad de unidades por módulo (3: pasión, play, práctica) | Código |
| Fases 5P (cuál va primero, cuál segunda, cuál tercera) | Código |
| Duración por fase (10 / 15 / 30 min) | Código (sobreescribe lo que sugiera el LLM) |
| **Título de la unidad** | **LLM** |
| **Contenido textual de la unidad** | **LLM** |
| **5 ejercicios multiple_choice con A/B/C/D** | **LLM** |
| **Recursos de estudio (video, guía, sandbox)** | **LLM** (curado + cacheado) |
| **Feedback empático ante respuesta incorrecta** | **LLM** |
| Validación de respuesta del alumno | Código (string match) |
| Cálculo de mastery (% aciertos por skill) | Código |

**Por qué híbrida:**

1. **Costo y velocidad**: menos llamadas al LLM = más rápido y más barato.
2. **Consistencia**: la estructura nunca varía aunque el LLM se equivoque.
3. **Mantenibilidad**: cambios al modelo pedagógico se hacen en código, no en prompts.
4. **Auditabilidad**: las reglas de negocio (qué se enseña, en qué orden) son trazables en el repo, no en un blackbox.

## Proveedores soportados

### Groq (Llama 3.3 70B) — recomendado

| Aspecto | Detalle |
|---|---|
| Modelo default | `llama-3.3-70b-versatile` |
| Free tier RPM | 30 |
| **Free tier RPD** | **14.400** (10x Gemini) |
| Latencia típica | 1-3 s por call |
| JSON mode | `response_format={"type": "json_object"}` + schema en system prompt |
| API key | https://console.groq.com/keys |
| Costo | Gratis, sin tarjeta |

### Google Gemini — alternativa

| Aspecto | Detalle |
|---|---|
| Modelo default usable | `gemini-2.5-flash-lite` |
| Free tier RPM | 30 |
| Free tier RPD | 1.500 |
| Latencia típica | 3-7 s por call |
| JSON mode | `response_mime_type: application/json` + `response_schema` |
| API key | https://aistudio.google.com/apikey |
| Costo | Gratis, sin tarjeta |

### Cómo cambiar entre proveedores

Una sola env var en Render → Environment:

```
PLAN_GENERATOR=groq    # o gemini, o mock
```

Save → Render redeploya solo en ~30s. El código no cambia.

Si querés cambiar el modelo específico dentro del mismo proveedor:

```
GROQ_MODEL=llama-3.1-8b-instant       # ej. para test más rápido
GEMINI_MODEL=gemini-flash-latest
```

Ambos proveedores comparten la misma interfaz (`generate_json(prompt, response_schema, temperature)`) — ver `app/shared/llm.py`.

## Componentes clave del código

### `app/shared/llm.py`

Wrapper de los clientes Groq y Gemini con la misma interfaz pública. Si mañana se cambia de proveedor, solo se agrega una nueva clase acá.

```python
class GroqClient:
    def generate_json(self, prompt, response_schema, temperature) -> dict: ...

class GeminiClient:
    def generate_json(self, prompt, response_schema, temperature) -> dict: ...
```

### `app/modules/learning_paths/plan_generator/_base_llm.py`

Clase base `LlmBackedPlanGenerator` con toda la lógica de armado del plan:

- Filtra skills por status.
- Ordena por priority.
- Genera units en paralelo con `ThreadPoolExecutor`.
- Fuerza `phase` y `estimated_minutes` desde código (no las delega al LLM).

Las clases `GroqPlanGenerator` y `GeminiPlanGenerator` son sub-clases de ~4 líneas cada una que solo inyectan el cliente.

### `app/modules/learning_paths/plan_generator/prompts.py`

Acá vive el **conocimiento del dominio educativo**. Define:

- Contexto del sistema (plataforma argentina, jóvenes vulnerables, sector IT).
- Datos del estudiante a inyectar en cada llamada (nombre, intereses, empresa objetivo, rol objetivo).
- Instrucciones específicas por fase 5P (qué tono usar en Pasión, cómo plantear el sandbox en Play, qué exigir en Práctica).
- Tono solicitado (español rioplatense, segunda persona).
- Formato de ejercicios multiple_choice (A/B/C/D embebido en el prompt, expected_answer como letra).

**Este archivo es lo más valioso del módulo desde la perspectiva pedagógica.** Cambios al modelo educativo se reflejan acá.

### `app/modules/learning_paths/plan_generator/factory.py`

Lee la env var `PLAN_GENERATOR` y devuelve el generador:

- `mock` → `MockPlanGenerator`
- `groq` → `GroqPlanGenerator` envuelto en `_PlanGeneratorWithMockFallback`
- `gemini` → `GeminiPlanGenerator` envuelto en `_PlanGeneratorWithMockFallback`

El wrapper de fallback atrapa **cualquier excepción** del generator primario, loguea el error, y devuelve el resultado del MockPlanGenerator. El cliente ve un plan válido, y el campo `generator_used` en la respuesta indica si fue `"groq"`, `"gemini"` o `"mock"`.

### `app/modules/resources/suggester.py`

LLM que sugiere recursos externos (videos, guías, sandboxes). Detalles en `resources-design.md`. Lo crítico:

- **Anti-alucinación de URLs**: el LLM nunca devuelve URL exacta de YouTube. Devuelve `search_terms` y armamos `https://www.youtube.com/results?search_query=...`. Para docs estables (MDN, react.dev, etc.), validamos contra una whitelist antes de aceptar la URL canónica.
- **Cache en BD**: una vez sugeridos los recursos para `(skill, fase)`, quedan persistidos. Próximos planes no llaman al LLM.

### `app/modules/attempts/feedback.py`

Genera feedback empático cuando el alumno falla un ejercicio (Paciencia, 4° P transversal). Usa el mismo cliente que el resto del sistema (Groq o Gemini según `PLAN_GENERATOR`).

Prompt explícito: *"NO digas si la respuesta era correcta, NO reveles la respuesta esperada. Normalizá el error, ofrecé una pista conceptual, motivá a intentar de nuevo. Máximo 60 palabras."*

Si el LLM falla, hay un mensaje estático de respaldo:

> *"No te preocupes, equivocarte es parte de aprender. Repasá el concepto y volvé a intentarlo..."*

## Configuración

Variables de entorno requeridas (en Render o `.env` local):

| Variable | Valores | Descripción |
|---|---|---|
| `PLAN_GENERATOR` | `mock` (default) / `groq` / `gemini` | Selecciona el proveedor activo |
| `GROQ_API_KEY` | string | API key de Groq Cloud |
| `GROQ_MODEL` | string (default `llama-3.3-70b-versatile`) | Modelo de Groq |
| `GEMINI_API_KEY` | string | API key de Google AI Studio |
| `GEMINI_MODEL` | string (default `gemini-2.0-flash`) | Modelo de Gemini |

Las variables de un proveedor inactivo (ej. `GEMINI_API_KEY` si `PLAN_GENERATOR=groq`) **se pueden dejar configuradas** — el código las ignora. Útil para volver al proveedor anterior cambiando una sola variable.

## Manejo de fallas

| Falla | Comportamiento |
|---|---|
| `API_KEY` del proveedor activo no seteada | Factory atrapa el error, devuelve Mock |
| Quota del LLM agotada (`429`) | Fallback a Mock, log de error, `generator_used = "mock"` |
| Modelo no disponible (`404`) | Fallback a Mock, log de error |
| LLM devuelve JSON inválido | Pydantic levanta `ValidationError`, fallback a Mock |
| Timeout de Render (>30s) | Render corta la conexión, el cliente recibe error HTTP. **El plan no se persiste** |
| Suggester de recursos falla | Las units quedan con `resources: []`, el plan se persiste igual |
| Feedback de attempt falla | Se devuelve un mensaje estático de Paciencia |

**El sistema nunca devuelve 500 por culpa de la IA**, salvo timeout del propio Render.

## Cómo se ve el resultado

Cada plan persistido tiene un campo de auditoría:

```json
"generator_used": "groq"   // o "gemini" o "mock"
```

Eso permite:

- Distinguir en la base qué planes fueron generados por IA vs. por fallback.
- Trackear la disponibilidad del LLM en tiempo real (alarma si demasiados `mock` aparecen en producción).
- Medir costo asociado (cantidad de llamadas al LLM por día).

Query útil:

```sql
SELECT generator_used, COUNT(*)
FROM learning_paths
GROUP BY generator_used;
```

## ¿Es "IA real"?

Sí, en el sentido de que **el contenido educativo, los títulos, los ejercicios, los recursos sugeridos y los mensajes de feedback son generados por un LLM**, no plantillas hardcodeadas. La IA produce texto natural en español rioplatense, conecta intereses del estudiante con la skill a aprender, propone ejercicios contextualizados a la empresa objetivo, y reacciona empáticamente a los errores.

No es "IA propia": no entrenamos un modelo, ni hicimos fine-tuning. La inteligencia de propósito general la aporta Groq/Google; nuestro aporte es:

- **Modelado del problema**: 5P, gap-based, estructura híbrida, fallback.
- **Prompts**: dirigen el modelo hacia el caso de uso.
- **Curación con guardrails**: anti-alucinación de URLs, validación con schema, fallbacks deterministas.
- **Integración multi-proveedor**: el sistema sigue funcionando si un proveedor cae.

Para una posible evolución post-MVP:

- Fine-tuning del modelo con casos curados de tutores reales (después de validación con usuarios).
- A/B testing entre prompts distintos para medir mejora pedagógica.
- Evaluación automatizada de respuestas text/code de estudiantes con LLM (no solo multiple_choice).
- Cache LRU de feedback por `(exercise, answer)` para reducir RPM.

## Decisiones para futuros responsables del módulo

1. **No agregar lógica de negocio en los prompts.** El prompt define tono y formato; las reglas pedagógicas viven en el código (`_base_llm.py`, `service.py`).
2. **No remover el fallback a Mock.** El sistema tiene que sobrevivir sin LLM para garantizar disponibilidad en demos y desarrollo.
3. **No cachear respuestas del LLM en código sin pensarlo.** Cada estudiante recibe contenido personalizado a sus intereses; un cache naive rompe esa premisa. La excepción es `resources`, que sí cachea porque se referencia por `(skill, fase)` y es independiente del estudiante.
4. **Si se agrega un proveedor más** (OpenAI, Anthropic, etc.): crear `OpenAIClient` en `app/shared/llm.py` y `OpenAIPlanGenerator` (4 líneas) en `plan_generator/`. Cambiar el factory para reconocerlo. El resto del sistema no se entera.
5. **Si se cambia el formato de los ejercicios** (ej. agregar text/code además de multiple_choice): actualizar el prompt en `prompts.py`, el schema en `_base_llm.UNIT_RESPONSE_SCHEMA`, y la lógica de evaluación en `attempts/service._evaluate`.
