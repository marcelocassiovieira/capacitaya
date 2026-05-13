# Integración con IA — Generación de Learning Paths

Documenta cómo el módulo `learning_paths` integra IA generativa (Google Gemini) para producir el contenido de los planes de capacitación, qué decisiones se tomaron y qué partes del sistema son determinísticas vs. delegadas al modelo.

## Resumen ejecutivo

- **No entrenamos un modelo propio**, ni hicimos fine-tuning.
- Usamos **Google Gemini 2.5 Flash Lite**, un LLM pre-entrenado de propósito general, vía API REST.
- La "inteligencia del dominio" vive en **nuestros prompts** y en una **estrategia híbrida** que mantiene la estructura del plan en código y delega solo la generación de contenido al LLM.
- El sistema tiene **fallback automático** a un generador mock si Gemini falla o se queda sin cuota, garantizando que la API nunca rompe por culpa de la IA.

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
│   gemini → GeminiPlanGenerator        │
│            envuelto en fallback a Mock│
└───────────┬───────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────┐
│ GeminiPlanGenerator                       │
│ 1. Arma estructura determinística         │
│    (módulos por skill, fases 5P fijas)    │
│ 2. Por cada unit: llamada a Gemini con    │
│    prompt + response_schema               │
│ 3. Llamadas en PARALELO (ThreadPool)      │
│ 4. Si una falla → excepción → fallback    │
└───────────┬───────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ SqlAlchemyLearningPathRepository.save │
│ Persiste plan completo como JSON      │
│ en Postgres (Neon)                    │
└───────────────────────────────────────┘
```

## Estrategia híbrida: qué hace el código y qué hace la IA

| Decisión | Quién la toma |
|---|---|
| Qué skills entran al plan (status != READY) | Código |
| Orden de los módulos (por priority HIGH > MEDIUM > LOW) | Código |
| Cantidad de unidades por módulo (3: pasión, play, práctica) | Código |
| Fases 5P (cuál va primero, cuál segunda, cuál tercera) | Código |
| Estimación de duración por fase | Código (fallback) |
| **Título de la unidad** | **Gemini** |
| **Contenido textual de la unidad** | **Gemini** |
| **Ejercicios (prompt, type, expected_answer, difficulty)** | **Gemini** |

**Por qué híbrida:**

1. **Costo y velocidad**: menos llamadas al LLM = más rápido y más barato.
2. **Consistencia**: la estructura nunca varía aunque el LLM se equivoque.
3. **Mantenibilidad**: cambios al modelo pedagógico se hacen en código, no en prompts.
4. **Auditabilidad**: las reglas de negocio (qué se enseña, en qué orden) son trazables en el repo, no en un blackbox.

## Componentes clave del código

### `app/shared/llm.py` — Wrapper del cliente Gemini

Encapsula la SDK de Google Gemini. Si mañana se cambia de proveedor (OpenAI, Anthropic, Groq), solo se toca este archivo.

```python
class GeminiClient:
    def generate_json(self, prompt, response_schema, temperature=0.7) -> dict:
        ...
```

Usa **structured output** de Gemini (`response_mime_type: application/json` + `response_schema`) para garantizar que la respuesta sea siempre JSON parseable según el schema declarado.

### `app/modules/learning_paths/plan_generator/prompts.py` — Templates de prompts

Acá vive el **conocimiento del dominio educativo**. Define:

- Contexto del sistema (plataforma argentina, jóvenes vulnerables, sector IT).
- Datos del estudiante a inyectar en cada llamada (nombre, intereses, empresa objetivo, rol objetivo).
- Instrucciones específicas por fase 5P (qué tono usar en Pasión, cómo plantear el sandbox en Play, qué exigir en Práctica).
- Tono solicitado (español rioplatense, segunda persona).

**Este archivo es lo más valioso del módulo desde la perspectiva pedagógica.** Cambios al modelo educativo se reflejan acá.

### `app/modules/learning_paths/plan_generator/gemini.py` — Generator real

Implementa el `Protocol` `PlanGenerator`. Por cada combinación `(skill, fase)`:

1. Construye un prompt específico con `build_unit_prompt`.
2. Llama a Gemini con `response_schema` del `GeneratedUnit`.
3. Valida la respuesta con Pydantic.
4. Fuerza `phase` y `estimated_minutes` desde el código (no se delegan al LLM para garantizar consistencia).

Todas las llamadas a Gemini se hacen **en paralelo** con un `ThreadPoolExecutor` (`_MAX_PARALLEL_CALLS = 5`).

### `app/modules/learning_paths/plan_generator/factory.py` — Selección por env var

Lee la env var `PLAN_GENERATOR`:

- `mock` (default) → `MockPlanGenerator` — determinístico, sin IA, útil para desarrollo local sin gastar cuota.
- `gemini` → `GeminiPlanGenerator` envuelto en `_GeminiWithMockFallback`.

El wrapper de fallback atrapa **cualquier excepción** del generator primario, loguea el error, y devuelve el resultado del MockPlanGenerator. El cliente ve un plan válido, y el campo `generator_used` en la respuesta indica si fue `"gemini"` o `"mock"`.

## Configuración

Variables de entorno requeridas (en Render o `.env` local):

| Variable | Valores | Descripción |
|---|---|---|
| `PLAN_GENERATOR` | `mock` (default) o `gemini` | Selecciona el generador |
| `GEMINI_API_KEY` | string | API key de Google AI Studio. Se obtiene gratis en https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | string (default `gemini-2.0-flash`) | Modelo de Gemini a usar. En producción usamos `gemini-2.5-flash-lite` por estar disponible en free tier |

## Modelo elegido y por qué

**`gemini-2.5-flash-lite`** porque:

- Free tier real (los modelos `flash` "completos" tienen cuota muy limitada o nula en free tier).
- Latencia baja: cada llamada termina en ~3-7s.
- Calidad suficiente para texto educativo en español.
- Suficiente para 1500 requests/día gratis, alcanza para uso académico.

Probamos antes `gemini-2.0-flash` (cuota free = 0 para esta cuenta) y `gemini-1.5-flash` (alias retirado por Google). Ambos fallaron, por eso documentamos esto.

## Manejo de fallas

| Falla | Comportamiento |
|---|---|
| `GEMINI_API_KEY` no seteada | Factory atrapa el error en `__init__`, devuelve Mock |
| Quota de Gemini agotada (`429`) | Fallback a Mock, log de error |
| Modelo no disponible (`404`) | Fallback a Mock, log de error |
| Gemini devuelve JSON inválido | Pydantic levanta `ValidationError`, fallback a Mock, log |
| Timeout de Render (>30s) | Render corta la conexión, el cliente recibe error HTTP |

**Para evitar el último caso**: si el GapReport tiene más de 2 skills, las 6+ llamadas paralelas pueden rozar los 30s del free tier de Render. Mitigaciones futuras:

- Pasar a respuesta asincrónica (`202 Accepted` + polling).
- Reducir a 1-2 fases por skill (solo Práctica con IA).
- Cache de plantillas por skill cuando se repiten.

## Cómo se ve el resultado

Cada plan persistido tiene un campo:

```json
"generator_used": "gemini"   // o "mock"
```

Eso permite:

- Distinguir en la base qué planes fueron generados por IA vs. por fallback.
- Trackear la disponibilidad de Gemini en tiempo real (alarma si demasiados `mock` aparecen en producción).
- Medir el costo asociado (cantidad de llamadas a la API por día).

Query útil:

```sql
SELECT generator_used, COUNT(*)
FROM learning_paths
GROUP BY generator_used;
```

## ¿Es "IA real"?

Sí, en el sentido de que **el contenido educativo, los títulos y los ejercicios son generados por un LLM** (Gemini), no plantillas hardcodeadas. La IA produce texto natural en español rioplatense, conecta intereses del estudiante con la skill a aprender, y propone ejercicios contextualizados a la empresa objetivo.

No es "IA propia": no entrenamos un modelo, ni hicimos fine-tuning. La inteligencia de propósito general la aporta Google; nuestro aporte es el **modelado del problema** (5P, gap-based, estructura híbrida, fallback) y los **prompts** que dirigen el modelo hacia el caso de uso.

Para una posible evolución post-MVP:

- Fine-tuning de Gemini con casos curados de tutores reales (después de validación con usuarios).
- A/B testing entre prompts distintos para medir mejora pedagógica.
- Evaluación automatizada de respuestas de estudiantes con Gemini (módulo `attempts`).

## Decisiones para futuros responsables del módulo

1. **No agregar lógica de negocio en los prompts.** El prompt define tono y formato; las reglas pedagógicas viven en el código (`gemini.py`, `service.py`).
2. **No remover el fallback a Mock.** El sistema tiene que sobrevivir sin Gemini para garantizar disponibilidad en demos y desarrollo.
3. **No cachear respuestas de Gemini en código sin pensarlo.** Cada estudiante recibe contenido personalizado a sus intereses; un cache naive rompe esa premisa.
4. **Si se cambia de proveedor**: solo tocar `app/shared/llm.py` y la implementación específica (ej. `openai.py` paralelo a `gemini.py`). El resto del sistema no se entera.
