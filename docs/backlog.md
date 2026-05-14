# Backlog — Épicas pendientes

Backlog de las próximas épicas para Equipo 2 (Capacitación + Tutores). Cada épica lista user stories, endpoints involucrados, esfuerzo estimado y criterio de aceptación.

Estado actual: ver [5p-coverage.md](5p-coverage.md) y [scope-equipos.md](scope-equipos.md).

## Orden sugerido para cerrar el MVP del modelo

1. Épica 1 — Perseverancia (cierra las 5P).
2. Épica 2 — Tutores (demuestra HITL).
3. Épica 3 — Alertas.
4. Épica 4 — Next-unit logic.

Las cuatro juntas dejan el sistema completo según los documentos del modelo. Total estimado: ~13-16 horas.

---

## Épica 1 — Perseverancia y métricas del alumno

Cierra la 5° P del modelo (Perseverancia) implementando la visualización del progreso y el tracking de actividad.

**Módulos a crear:** `sessions` + `student_metrics`.

**User stories:**

- Como alumno quiero ver mi progreso (% completado, hitos, streak de días) para mantenerme motivado, sin ver mi readiness_score numérico crudo.
- Como alumno quiero saber qué skills dominé y cuáles me faltan.
- Como tutor quiero ver métricas detalladas de mis asignados (frecuencia, tasa de éxito, dominios estancados).
- Como sistema quiero registrar las sesiones del alumno (inicio, fin, duración).

**Endpoints:**

- `POST /sessions/start`
- `POST /sessions/{id}/end`
- `GET /students/{email}/sessions`
- `GET /students/{email}/progress` (vista motivacional para el alumno)
- `GET /students/{email}/metrics` (vista de seguimiento para el tutor)

**Criterio de aceptación:**

- El alumno ve "Vas por el 40%", "Dominaste 2 de 5 habilidades", "Te faltan 3 ejercicios para dominar SQL", "7 días seguidos aprendiendo".
- El alumno NO ve el `readiness_score` numérico.
- El tutor ve frecuencia de sesiones, duración promedio, días de inactividad, ratio teoría/práctica.

**Esfuerzo estimado:** 3-4 h.

---

## Épica 2 — Tutores y asignaciones

Implementa el HITL del modelo: padrón de tutores + asignación a alumnos + dashboard.

**Módulos a crear:** `tutors` + `tutor_assignments`.

**User stories:**

- Como admin quiero registrar tutores con especialidades (skills que enseñan).
- Como admin quiero asignar un tutor a un alumno cuando se crea su plan.
- Como tutor quiero ver mi dashboard con todos mis alumnos asignados y su estado.
- Como tutor quiero ver el detalle de un alumno (progreso, attempts, recursos).

**Endpoints:**

- `POST /tutors`, `GET /tutors`, `GET /tutors/{id}`, `PATCH /tutors/{id}`
- `POST /tutor-assignments`
- `GET /tutors/{id}/dashboard` (resumen con todos los asignados)
- `GET /tutors/{id}/students/{student_email}` (detalle de un alumno)

**Criterio de aceptación:**

- Un tutor solo ve a sus alumnos asignados, nunca a alumnos de otros tutores.
- Un alumno tiene a lo sumo un tutor activo por path.
- El dashboard del tutor muestra alertas activas (cuando esté implementada la Épica 3).

**Esfuerzo estimado:** 4-5 h.

---

## Épica 3 — Sistema de alertas

Detecta señales de riesgo de abandono o frustración y las muestra al tutor.

**Módulo a crear:** `alerts`.

**Tipos de alerta:**

| Tipo | Trigger | Nivel |
|---|---|---|
| `LOW_PERSEVERANCE` | 5 intentos fallidos seguidos en el mismo ejercicio | 1 |
| `ABANDON_RISK` | 72hs sin actividad | 2 |
| `ABANDON_RISK` | 7 días sin actividad | 3 (escala a admin) |
| `LOST_PASSION` | Tiempo promedio de sesión cae >50% en 5 días | 1 |
| `ANOMALY_PATIENCE` | Lenguaje agresivo detectado por NLP (post-MVP) | 2 |

**User stories:**

- Como sistema quiero generar alertas automáticamente cuando se cumplan los triggers.
- Como tutor quiero ver alertas activas de mis asignados, filtrables por nivel.
- Como tutor quiero marcar una alerta como resuelta tras intervenir.
- Como admin quiero recibir alertas nivel 3.

**Endpoints:**

- `GET /alerts?tutor_id=X&student_email=Y&resolved=false`
- `GET /alerts/{id}`
- `PATCH /alerts/{id}/resolve`

**Implementación:** generación síncrona dentro de `POST /attempts` (`LOW_PERSEVERANCE`) y un check de inactividad puede correr al consultar el dashboard del tutor (`ABANDON_RISK`).

**Criterio de aceptación:**

- El alumno NUNCA ve sus alertas.
- El tutor ve solo alertas de sus asignados.
- Una alerta resuelta queda registrada con `resolved_by_tutor_id`.

**Esfuerzo estimado:** 3-4 h.

---

## Épica 4 — Next-unit logic y desbloqueo progresivo

Le da al alumno una ruta clara de qué hacer ahora y bloquea el avance hasta dominar.

**User stories:**

- Como alumno quiero saber qué unidad debo hacer ahora según mi progreso.
- Como sistema quiero bloquear las skills siguientes hasta dominar la actual (mastery >= 80%).
- Como alumno quiero recibir una explicación alternativa si no alcanzo el dominio tras N intentos en una skill.

**Endpoints:**

- `GET /learning-paths/{id}/next-unit` (devuelve la próxima unit pendiente según mastery)
- `PATCH /learning-paths/{id}/regenerate-unit` (genera contenido alternativo cuando hay bloqueo)

**Criterio de aceptación:**

- Si el alumno no terminó la unit de Pasión de Git, `next-unit` la devuelve.
- Si dominó Git al 80%, `next-unit` devuelve la primera unit de la siguiente skill.
- Si falló 5 veces seguidas, `regenerate-unit` produce contenido nuevo con prompt alternativo al LLM.

**Esfuerzo estimado:** 2-3 h.

---

## Épica 5 — Validaciones críticas (entregables con ojo humano)

Algunos entregables requieren juicio humano (presentaciones, code review de proyectos).

**Módulo a crear:** `validations`.

**User stories:**

- Como alumno quiero subir un entregable (link a repo, video, presentación) asociado a una unit.
- Como tutor quiero ver entregables pendientes de mis asignados.
- Como tutor quiero aprobar/rechazar un entregable con feedback escrito.
- Como alumno quiero ver el feedback de mis entregables.

**Endpoints:**

- `POST /validations` (alumno sube link)
- `GET /tutors/{id}/pending-validations`
- `PATCH /validations/{id}/validate` (tutor aprueba/rechaza con feedback)

**Esfuerzo estimado:** 3 h.

---

## Épica 6 — Auth básica con headers mock

Activa la matriz de accesos (`access-matrix.md`) que hoy está documentada pero no aplicada.

**User stories:**

- Como sistema quiero leer `X-User-Id` y `X-User-Role` de los headers en MVP (mock auth).
- Como sistema quiero rechazar endpoints según rol (ej. solo admin puede crear company, solo tutor puede ver alertas de sus asignados).
- Como sistema quiero, post-MVP, reemplazar el header mock por JWT real sin cambiar la matriz.

**Cambios:**

- Crear `app/modules/auth/dependencies.py` con `Depends(get_current_user)` que lee headers.
- Decorar cada endpoint con el rol requerido.

**Criterio de aceptación:**

- `POST /tutors` sin header → `401`.
- `POST /tutors` con `X-User-Role=student` → `403`.
- `GET /tutors/{id}/dashboard` con header de otro tutor → `403`.

**Esfuerzo estimado:** 3-4 h headers mock, +6-8 h para JWT real.

---

## Épica 7 — Eventos hacia Equipo 1

Implementa el contrato Equipo 2 → Equipo 1 definido en `scope-equipos.md`.

**User stories:**

- Como sistema quiero emitir un evento append-only cada vez que algo relevante pasa en el ciclo del alumno.
- Como Equipo 1 quiero leer la tabla `events` para calcular métricas globales.

**Eventos a emitir:**

```
session_started, session_ended
exercise_attempted, exercise_completed
unit_completed, module_completed, path_completed
mastery_achieved (skill llega al 80%)
alert_raised, tutor_intervened
```

**Cambios:**

- Tabla `events` con `student_email`, `type`, `payload_json`, `created_at`.
- Helper `events.emit(type, payload)` llamado desde los services existentes (`attempts.create_attempt`, `sessions.end`, etc.).

**Esfuerzo estimado:** 2 h.

---

## Épica 8 — Calidad técnica

User stories transversales que no agregan funcionalidad pero suben calidad del entregable.

**Items:**

- Tests unitarios y de integración con `pytest` y `httpx`. Cobertura mínima del flujo de happy path en cada módulo.
- CORS habilitado para frontend en otro dominio (`fastapi.middleware.cors.CORSMiddleware`).
- Migración de `Base.metadata.create_all` a Alembic para gestionar cambios de schema sin perder datos.

**Esfuerzo estimado:** 4-6 h total (cada item ~1-2 h).
