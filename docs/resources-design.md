# Módulo `resources` — Catálogo de contenido de estudio

Documento de diseño del módulo `resources`. Explica qué problema resuelve, cómo se integra al ciclo de generación de planes y por qué algunas decisiones son las que son.

## Problema que resuelve

El módulo `learning_paths` genera planes con `content` extenso (texto educativo) y `exercises` (multiple choice). Eso cubre lo que el alumno **lee** y lo que **practica formalmente**, pero los documentos del modelo 5P piden también:

- **Videos** ("micro-lecciones de 5 a 10 minutos").
- **Sandbox interactivos** ("exploración sin penalización", fase Play).
- **Material de referencia** (documentación oficial, guías, cheatsheets).
- **Ejercicios externos** (FreeCodeCamp, HackerRank).

Estos son **recursos externos** — el sistema no los aloja, solo los referencia. Su lugar natural es **al lado del content de cada unit**, contextualizados por skill y fase.

## Decisiones de diseño

### Fuente de los recursos: LLM con guardrails anti-alucinación

Los LLMs alucinan URLs de YouTube (videos con IDs inventados que dan 404). Para evitarlo:

- Le pedimos al LLM **título + canal/fuente + términos de búsqueda**, no URL exacta.
- Para documentación oficial estable (MDN, `git-scm.com`, `react.dev`, etc.), sí permitimos URL canónica, validando contra una **whitelist** de dominios conocidos (`_KNOWN_DOC_DOMAINS` en `suggester.py`).
- Para todo lo demás, el campo `url` se arma como **search URL**: `https://www.youtube.com/results?search_query=...`. Esos links nunca mueren — siempre llevan a una página de resultados real.

Ventaja: las URLs siempre funcionan. Costo: el alumno hace un click extra (búsqueda → resultado).

### Granularidad: por (skill, fase 5P)

Una tabla `resources` con clave funcional `(skill_name, phase)`. Ejemplos:

- `(JavaScript, pasion)` → recursos motivacionales para JS.
- `(JavaScript, play)` → sandboxes y playgrounds de JS.
- `(JavaScript, practica)` → guías oficiales, cheatsheets, plataformas de ejercicios.
- `(Git, pasion)` → recursos motivacionales para Git.
- etc.

Eso significa que **dos planes que necesiten JavaScript reutilizan los mismos recursos** — el catálogo crece linealmente con la cantidad de skills × 3 fases, no con la cantidad de planes.

### Cuándo se generan: lazy con cache en BD

Pattern **cache-aside**:

```
service.get_or_suggest(db, skill, phase)
    ↓
1. repository.find_active_by_skill_and_phase(...) → hay rows?
       Sí  → return rows
       No  → continuar
    ↓
2. suggester.suggest_resources(...) → LLM produce recursos
    ↓
3. repository.bulk_save(...) → persiste
    ↓
4. return resources persistidos
```

Resultado:

- Primer plan con `JavaScript` → llama al LLM, persiste, devuelve.
- Segundo plan con `JavaScript` → lee de BD, no llama al LLM.
- Latencia del segundo plan: ~20ms en lugar de ~3-6s.
- Costo: cada combinación skill/fase paga UNA sola llamada al LLM en toda su vida.

### Cuándo se adjuntan al plan: al momento de la generación

Decisión: los recursos **se embeben dentro del `plan_json`** al generar el plan, no se buscan dinámicamente cada vez que el alumno pide la unit.

Pro: simplicidad — el plan queda autocontenido.
Contra: si actualizás un recurso, los planes ya generados no se enteran.

Esto es coherente con cómo guardamos los `exercises`: también quedan congelados dentro del `plan_json`. Si en algún momento querés que los recursos se actualicen dinámicamente, hay que reemplazar este enriquecimiento por un lookup en `GET /learning-paths/{id}/units/{i}/{j}`.

### Esquema de la respuesta del LLM

El `suggester` le pide al modelo un schema acotado para reducir errores:

```python
{
  "type": "video" | "guide" | "sandbox" | "reading",
  "title": str,
  "source": str,           # "FreeCodeCamp", "MDN", "Traversy Media", ...
  "search_terms": str,     # Para armar la URL de búsqueda si no hay URL canónica
  "canonical_url": str,    # Solo si es de un dominio conocido y estable
  "description": str,
  "duration_minutes": int,
  "level": "beginner" | "intermediate" | "advanced"
}
```

El cliente Python (`suggester._resolve_url`) decide la URL final:

- Si `canonical_url` apunta a un dominio en `_KNOWN_DOC_DOMAINS` → la usa.
- Si no → arma una URL de búsqueda en YouTube (para videos) o Google (para resto).

Esto produce una **garantía dura**: ningún URL persistido apunta a un recurso inexistente.

### Cantidades sugeridas por fase

Configurado en `_PHASE_INSTRUCTIONS` del suggester:

| Fase | Cuántos recursos | Qué tipo |
|---|---|---|
| `pasion` | 2 | 1 video motivacional + 1 lectura introductoria |
| `play` | 2 | 1 sandbox interactivo + 1 tutorial corto |
| `practica` | 3 | 1 guía oficial + 1 cheatsheet + 1 plataforma de ejercicios |

Para un plan con 2 skills, eso son **14 recursos** distribuidos en las 6 units. Si todas las skills están cacheadas, el enriquecimiento agrega <50ms al endpoint.

## Estructura del módulo

```
app/modules/resources/
├── __init__.py
├── models.py        # Resource (tabla SQLAlchemy)
├── schemas.py       # ResourceView (Pydantic, embebido en units)
├── repository.py    # find_active_by_skill_and_phase, bulk_save
├── service.py       # get_or_suggest (cache-aside)
└── suggester.py     # Llamada al LLM con schema y URL building
```

Sigue el mismo patrón que los otros módulos (`users`, `learning_paths`, `attempts`) — capas con responsabilidad única, repository aislado de SQLAlchemy.

## Tabla `resources`

```sql
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(255) NOT NULL,    -- "JavaScript", "Git", ...
    phase VARCHAR(20) NOT NULL,           -- "pasion" | "play" | "practica"
    type VARCHAR(20) NOT NULL,            -- "video" | "guide" | "sandbox" | "reading"
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    source VARCHAR(100),                  -- "FreeCodeCamp", "MDN", ...
    language VARCHAR(5) DEFAULT 'es',
    level VARCHAR(20),                    -- "beginner" | "intermediate" | "advanced"
    generated_by VARCHAR(20) DEFAULT 'manual',  -- "groq" | "gemini" | "manual"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_skill_name ON resources(skill_name);
CREATE INDEX idx_resources_phase ON resources(phase);
```

Las columnas `language` y `level` están pensadas para filtros futuros (ej. servirle a un alumno avanzado solo recursos `level=advanced`). Hoy se persisten pero no se filtran activamente.

`is_active` permite "desactivar" un recurso sin borrarlo (preserva la auditoría).

## Integración con el resto del sistema

```
POST /learning-paths
       │
       ▼
  service.create_learning_path(generator, repository, gap_report, db)
       │
       ├─ generator.generate(gap_report)        ← Groq genera units
       │
       ├─ _enrich_with_resources(plan, db)      ← NUEVO PASO
       │     │
       │     └─ Por cada (skill, phase) del plan:
       │           resources_service.get_or_suggest(db, skill, phase)
       │           → cache-hit: lee BD
       │           → cache-miss: pregunta al LLM + persiste
       │
       └─ repository.save(plan)                 ← persiste plan_json con resources adentro
```

El generator (`PlanGenerator`) **no conoce los recursos**. Eso preserva la separación: el generator sabe de contenido educativo, el resources module sabe de catálogo. Ambos se orquestan en `service.create_learning_path`.

## Manejo de fallas

| Falla | Comportamiento |
|---|---|
| LLM no configurado (no hay key, `PLAN_GENERATOR=mock`) | `suggester` devuelve `[]`, las units quedan sin `resources` |
| LLM falla (cuota, timeout) | Excepción capturada en `suggester`, devuelve `[]`, las units quedan sin `resources` |
| LLM devuelve JSON malformado | `try/except` en el parser, items inválidos se saltean |
| Resource ya existe (idempotencia) | Hoy se asume primera vez. Si se llama dos veces concurrentemente para la misma combo, podría duplicar. No bloquea ni rompe, pero suma rows duplicadas. Para evitarlo en alta concurrencia, agregar UNIQUE constraint `(skill_name, phase, url)` |

**El POST nunca falla por culpa de los recursos.** Si no hay recursos, las units van con `resources: []`. El alumno simplemente ve el plan sin material extra.

## Costo de la primera generación de cada skill

Para una skill nueva (sin recursos cacheados):

- 3 llamadas a Groq (una por fase) en serie.
- Cada llamada: ~1-3s con Llama 3.3 70B.
- Total agregado al POST: ~3-9s.

Si combinás esto con la generación inicial del plan (3 llamadas paralelas para units), el POST puede llegar a 15-25s. **Cerca del límite de 30s de Render free tier**, pero todavía dentro.

Para acelerar en el futuro:

- Paralelizar las llamadas del suggester con `ThreadPoolExecutor` igual que las del plan generator.
- O hacer el enriquecimiento asincrónico: el plan se devuelve sin recursos y un background task los agrega después.

## Cómo administrar el catálogo (post-MVP)

Hoy no hay endpoints CRUD para `resources`. Para administrar el catálogo:

- Borrar uno: `UPDATE resources SET is_active = FALSE WHERE id = X;` en Neon.
- Regenerar: borrar las rows de `(skill_name, phase)` y el próximo plan dispara la sugerencia de nuevo.
- Curar manualmente: `INSERT INTO resources (...)` con `generated_by = 'manual'`.

Cuando se necesite ABM real, sumar `app/modules/resources/router.py` con los endpoints estándar (`POST`, `GET`, `PATCH`, `DELETE`). El service y repository ya están listos para soportarlos.

## Riesgos conocidos

1. **Calidad variable de las sugerencias del LLM**: Llama 3.3 70B tiene buen conocimiento de canales conocidos pero a veces sugiere recursos genéricos. Mitigación posible: prompt más detallado con ejemplos de canales que sí/no sirven para el público objetivo (jóvenes vulnerables argentinos).
2. **Sin TTL de cache**: una vez generado un set de recursos para una skill, queda para siempre. Si en 1 año hay material mejor, no se actualiza. Mitigación post-MVP: campo `regenerated_at` y job que invalide recursos viejos.
3. **No hay analytics de uso**: no sabemos qué recursos se clickean. Para optimizar el catálogo, habría que sumar tracking de clicks por recurso. Out of scope del MVP.
