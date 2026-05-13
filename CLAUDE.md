# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Capacity AR API: MVP backend para una plataforma de aprendizaje adaptativo (5P + ITS con tutoría humana). El sistema se divide en dos equipos sobre el **mismo monolito modular** — Equipo 1 produce `GapReport`, Equipo 2 (este repo, módulo principal `learning_paths`) lo consume y genera el plan pedagógico. Ver `docs/scope-equipos.md` para el contrato entre equipos.

Stack: Python 3.12, FastAPI, SQLAlchemy 2.x síncrono, PostgreSQL en producción (Render), SQLite válido para desarrollo local.

## Comandos

```bash
# Entorno
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Levantar API (autoreload)
uvicorn app.main:app --reload
# Swagger: http://localhost:8000/docs

# Tests (pytest configurado en pyproject.toml, testpaths=["tests"])
# Nota: el directorio tests/ todavía no existe — al agregarlo, instalar dev deps:
pip install -e ".[dev]"
pytest                              # toda la suite
pytest tests/path/to/test_file.py   # un archivo
pytest -k "nombre_del_test"         # filtrar por nombre
```

Para correr con SQLite (sin PostgreSQL local), poner en `.env`:
```
DATABASE_URL=sqlite:///./capacity_ar_local.db
```

## Arquitectura

### Patrón de módulo (estricto, replicar al agregar capacidades)

Cada módulo en `app/modules/<capability>/` sigue capas con responsabilidad única:

- `router.py` — endpoints HTTP, validación de payloads, dependencias FastAPI. Sin reglas de negocio.
- `service.py` — orquestación, reglas, decisiones de error (HTTPException). Sin SQLAlchemy.
- `repository.py` — único lugar con SQLAlchemy. Funciones puras sobre `Session`.
- `models.py` — modelos SQLAlchemy declarativos (heredan de `app.database.Base`).
- `schemas.py` — contratos Pydantic de entrada/salida.

**Regla:** los routers NO importan SQLAlchemy directamente. Los services NO arman queries. El repositorio NO levanta HTTPException. Esta separación está validada en `docs/backend-onboarding.md` y es la convención que el código existente respeta.

### Inversión con Protocol + factory (módulo `learning_paths`)

`learning_paths` introduce un patrón que se va a repetir cuando haya proveedores externos (IA, persistencia alternativa):

- `plan_generator/base.py` define un `Protocol` (`PlanGenerator`).
- `plan_generator/mock.py` es la implementación actual (determinística, sin IA).
- `plan_generator/factory.py` devuelve la implementación y se inyecta vía `Depends(get_plan_generator)`.
- Mismo patrón en `repository/` (Protocol + `InMemoryLearningPathRepository` + factory con `lru_cache` para singleton).

Cuando se sume Gemini, agregar `plan_generator/gemini.py` y cambiar la factory. Cuando se persistan paths en DB, agregar `repository/sqlalchemy.py`. No hace falta refactorizar el resto.

**Importante:** el repositorio de `learning_paths` hoy es **in-memory** — los paths se pierden al reiniciar. El de `users` ya usa SQLAlchemy. No es inconsistencia: es el corte actual del MVP.

### Bootstrap y persistencia

- `app/main.py` corre `create_db_tables()` en el `lifespan` startup. Esto invoca `Base.metadata.create_all` — válido sólo para MVP. Cuando empiece a haber datos reales en ambientes persistentes, sumar Alembic (decidido en README).
- `app/config.py` normaliza URLs `postgres://` y `postgresql://` al driver `postgresql+psycopg://` (necesario porque Render entrega URLs sin el driver explícito).
- `app/database.py` expone `get_db` (generator usado como FastAPI dependency).

### Contratos entre equipos

El módulo `learning_paths` recibe un `GapReport` (definido en `app/modules/learning_paths/schemas.py`, alineado con `docs/gap-engine-mvp.md`). Si el formato del GapReport cambia, **es un cambio de contrato entre equipos** — coordinar antes de tocar los schemas.

`SkillStatus` values: `READY`, `NEEDS_WORK`, `MISSING`. Si todas las skills llegan en `READY`, `create_learning_path` devuelve 409 (no genera plan vacío).

### Roles y acceso

`UserRole`: `student | tutor | company_admin | admin`. La matriz completa de permisos por entidad está en `docs/access-matrix.md`. **Auth está diferida intencionalmente** (decisión documentada) — los endpoints son públicos en MVP. Cuando se sume `auth/`, los chequeos van como dependency, no cambia la matriz.

Regla de visibilidad relevante para diseñar nuevos endpoints:
- estudiante nunca ve su `readiness_score` numérico crudo ni sus alertas
- tutor sólo ve a sus asignados
- empresa en MVP **no ve avance** de estudiantes

## Convenciones específicas del proyecto

- Python 3.12, tipado estricto en firmas públicas (ver código existente como referencia).
- Versiones de dependencias **pinneadas exactas** en `requirements.txt` y `pyproject.toml`. No usar rangos.
- Comentarios y docs en español (sigue lo existente en `docs/` y en el código).
- `from_attributes=True` (Pydantic v2) cuando un schema mapea desde un modelo SQLAlchemy.
