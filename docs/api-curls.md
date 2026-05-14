# API Curls — Capacity AR

Guía de prueba de la API deployada para que los compañeros del equipo puedan probar los endpoints sin tener que levantar nada local.

## Links principales

- **API base:** https://capacity-ar-ap.onrender.com
- **Swagger UI (probar desde el navegador):** https://capacity-ar-ap.onrender.com/docs
- **Health check:** https://capacity-ar-ap.onrender.com/health

## Antes de empezar

El plan free de Render **duerme el servidor tras 15 minutos sin tráfico**. El primer request después de un rato tarda entre 30 y 50 segundos en despertar el contenedor. Los siguientes vuelan.

Para "calentar" el server antes de una prueba o demo:

```bash
curl https://capacity-ar-ap.onrender.com/health
```

Cuando devuelva `{"status":"ok","environment":"production"}` ya está listo.

## Endpoints disponibles

### Users

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/users` | Listar usuarios (con paginación) |
| `POST` | `/users` | Crear usuario |
| `GET` | `/users/{id}` | Obtener un usuario por id |
| `PATCH` | `/users/{id}` | Actualizar parcialmente |
| `DELETE` | `/users/{id}` | Borrar usuario |

Roles válidos: `student`, `tutor`, `company_admin`, `admin`.

### Learning paths

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/learning-paths` | Crear plan a partir de un GapReport |
| `GET` | `/learning-paths` | Listar planes |
| `GET` | `/learning-paths/{id}` | Obtener un plan por id |
| `GET` | `/students/{email}/learning-paths` | Listar planes de un estudiante |

### Attempts (ejercicios resueltos por el alumno)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/attempts` | Registrar intento, evalúa y devuelve feedback con IA |
| `GET` | `/attempts/{id}` | Ver un attempt |
| `GET` | `/students/{email}/attempts` | Historial de un estudiante |

---

## USERS — curls

### 1. Crear usuario

```bash
curl -X POST https://capacity-ar-ap.onrender.com/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Perez","email":"ana@example.com","role":"student"}'
```

Esperado: `201 Created` con el usuario, `id`, `created_at`, `updated_at`.

### 2. Crear un tutor

```bash
curl -X POST https://capacity-ar-ap.onrender.com/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Carlos","last_name":"Tutor","email":"carlos@example.com","role":"tutor"}'
```

### 3. Listar todos

```bash
curl https://capacity-ar-ap.onrender.com/users
```

### 4. Listar con paginación

```bash
curl "https://capacity-ar-ap.onrender.com/users?offset=0&limit=10"
```

### 5. Ver uno por id

```bash
curl https://capacity-ar-ap.onrender.com/users/1
```

### 6. Actualizar (PATCH parcial)

```bash
curl -X PATCH https://capacity-ar-ap.onrender.com/users/1 \
  -H "Content-Type: application/json" \
  -d '{"last_name":"Gonzalez"}'
```

### 7. Email duplicado → 409

```bash
curl -X POST https://capacity-ar-ap.onrender.com/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Otro","last_name":"Distinto","email":"ana@example.com","role":"tutor"}'
```

Esperado: `409 Conflict` con `{"detail":"Email already exists"}`.

### 8. Usuario inexistente → 404

```bash
curl https://capacity-ar-ap.onrender.com/users/9999
```

### 9. Borrar usuario

```bash
curl -X DELETE https://capacity-ar-ap.onrender.com/users/2
```

Esperado: `204 No Content`.

---

## LEARNING PATHS — curls

### 10. Crear path desde un GapReport (Ana — Backend Junior)

```bash
curl -X POST https://capacity-ar-ap.onrender.com/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "student": {
      "name": "Ana Perez",
      "email": "ana@example.com",
      "skills": [
        {"name": "Git", "level": 1},
        {"name": "SQL", "level": 2}
      ],
      "interests": ["backend", "logistica"]
    },
    "company": {"name": "Empresa Logistica SA"},
    "target_role": {
      "title": "Backend Developer Junior",
      "required_skills": [
        {"name": "Git", "level": 3, "priority": "HIGH"},
        {"name": "SQL", "level": 3, "priority": "HIGH"},
        {"name": "HTTP APIs", "level": 2, "priority": "MEDIUM"}
      ]
    },
    "summary": "Ana necesita reforzar Git, SQL y HTTP APIs.",
    "readiness_score": 45,
    "skills": [
      {"name": "Git", "current_level": 1, "required_level": 3, "gap_level": 2, "priority": "HIGH", "status": "MISSING"},
      {"name": "SQL", "current_level": 2, "required_level": 3, "gap_level": 1, "priority": "HIGH", "status": "NEEDS_WORK"},
      {"name": "HTTP APIs", "current_level": 0, "required_level": 2, "gap_level": 2, "priority": "MEDIUM", "status": "MISSING"}
    ]
  }'
```

Esperado: `201 Created` con un plan que incluye `id`, `status: "ACTIVE"`, `generator_used: "mock"`, 3 módulos (uno por skill MISSING/NEEDS_WORK) y cada módulo con 3 unidades (pasión, play, práctica).

### 11. Listar todos los paths

```bash
curl https://capacity-ar-ap.onrender.com/learning-paths
```

### 12. Ver un path por id

```bash
curl https://capacity-ar-ap.onrender.com/learning-paths/1
```

### 13. Listar paths de un estudiante por email

```bash
curl https://capacity-ar-ap.onrender.com/students/ana@example.com/learning-paths
```

### 14. Segundo path para Ana (pivot a Data)

```bash
curl -X POST https://capacity-ar-ap.onrender.com/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "student": {
      "name": "Ana Perez",
      "email": "ana@example.com",
      "skills": [{"name": "Python", "level": 2}],
      "interests": ["data"]
    },
    "company": {"name": "Empresa Data SA"},
    "target_role": {
      "title": "Data Analyst Junior",
      "required_skills": [
        {"name": "Python", "level": 3, "priority": "HIGH"},
        {"name": "Pandas", "level": 2, "priority": "MEDIUM"}
      ]
    },
    "summary": "Ana quiere pivotear a data.",
    "readiness_score": 35,
    "skills": [
      {"name": "Python", "current_level": 2, "required_level": 3, "gap_level": 1, "priority": "HIGH", "status": "NEEDS_WORK"},
      {"name": "Pandas", "current_level": 0, "required_level": 2, "gap_level": 2, "priority": "MEDIUM", "status": "MISSING"}
    ]
  }'
```

### 15. Estudiante ya cumple todo → 409

```bash
curl -X POST https://capacity-ar-ap.onrender.com/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "student": {"name":"Pro","email":"pro@example.com","skills":[],"interests":[]},
    "company": {"name":"Empresa Y"},
    "target_role": {"title":"Senior","required_skills":[{"name":"Git","level":3,"priority":"HIGH"}]},
    "summary":"Pro ya cumple todo.",
    "readiness_score": 100,
    "skills": [{"name":"Git","current_level":5,"required_level":3,"gap_level":-2,"priority":"HIGH","status":"READY"}]
  }'
```

Esperado: `409 Conflict` con `"El estudiante ya cumple todos los requerimientos del puesto."`.

### 16. Path inexistente → 404

```bash
curl https://capacity-ar-ap.onrender.com/learning-paths/9999
```

### 17. Payload inválido (falta `priority`) → 422

```bash
curl -X POST https://capacity-ar-ap.onrender.com/learning-paths \
  -H "Content-Type: application/json" \
  -d '{"student":{"name":"X","email":"x@x.com"},"company":{"name":"C"},"target_role":{"title":"T","required_skills":[{"name":"Git","level":3}]},"summary":"s","readiness_score":50,"skills":[{"name":"Git","current_level":1,"required_level":3,"gap_level":2,"priority":"HIGH","status":"MISSING"}]}'
```

Esperado: `422 Unprocessable Entity` con detalle del campo faltante.

---

## ATTEMPTS — curls

El módulo `attempts` cierra el ciclo del alumno: registra cada respuesta a un ejercicio, evalúa, calcula mastery y devuelve feedback empático con IA (Paciencia, 4° P del modelo 5P) cuando hay errores.

**Identificación del ejercicio:** se usa un identificador compuesto de 4 campos (`learning_path_id`, `module_index`, `unit_index`, `exercise_index`) en lugar de un ID directo. El servidor abre el plan, navega esa posición, lee el `expected_answer` original y compara.

**Precondición:** tiene que existir un `learning_path` previo con ejercicios en la unit de práctica (`unit_index=2`). Si tu plan tiene `generator_used: "mock"`, los ejercicios son placeholders y van a ser triviales de responder.

### A. Responder un ejercicio correctamente

Suponiendo que generaste un plan con id `7`, en JavaScript (`module_index=0`), unit Práctica (`unit_index=2`), primer ejercicio (`exercise_index=0`), con `expected_answer: "B"`:

```bash
curl -X POST https://capacity-ar-ap.onrender.com/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "student_email": "carlos.gamer@example.com",
    "learning_path_id": 7,
    "module_index": 0,
    "unit_index": 2,
    "exercise_index": 0,
    "answer": "B",
    "time_spent_seconds": 45
  }'
```

Esperado:

- `is_correct: true`.
- `score: 1.0`.
- `ai_feedback`: mensaje determinístico de felicitación.
- `skill_mastery`: 1.0 si es el primer intento correcto.
- `mastery_threshold_reached: true` si `skill_mastery >= 0.80`.

### B. Responder mal (activa Paciencia 5P)

Mismo plan, otro ejercicio:

```bash
curl -X POST https://capacity-ar-ap.onrender.com/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "student_email": "carlos.gamer@example.com",
    "learning_path_id": 7,
    "module_index": 0,
    "unit_index": 2,
    "exercise_index": 1,
    "answer": "Z"
  }'
```

Esperado:

- `is_correct: false`.
- `score: 0.0`.
- `ai_feedback`: mensaje empático generado por IA en español rioplatense, **que NO revela la respuesta correcta**, sino que ofrece una pista conceptual y motiva a intentar de nuevo.
- `skill_mastery` recalculado considerando aciertos / total de intentos previos.

### C. Ver un attempt específico

```bash
curl https://capacity-ar-ap.onrender.com/attempts/1
```

### D. Historial de un estudiante

```bash
curl https://capacity-ar-ap.onrender.com/students/carlos.gamer@example.com/attempts
```

Devuelve ordenado del más reciente al más viejo, con `skill_mastery` actualizado al momento de la consulta (no cuando se creó el attempt).

### E. Forzar un 404 — plan inexistente

```bash
curl -X POST https://capacity-ar-ap.onrender.com/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "student_email": "x@x.com",
    "learning_path_id": 99999,
    "module_index": 0,
    "unit_index": 2,
    "exercise_index": 0,
    "answer": "A"
  }'
```

Esperado: `404 Not Found`.

### F. Forzar un 403 — intentar resolver el plan de otro

Si el email no coincide con el `student_email` del plan:

```bash
curl -X POST https://capacity-ar-ap.onrender.com/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "student_email": "otro@example.com",
    "learning_path_id": 7,
    "module_index": 0,
    "unit_index": 2,
    "exercise_index": 0,
    "answer": "A"
  }'
```

Esperado: `403 Forbidden` con `"El learning path no pertenece a este estudiante."`.

### Verificar lo persistido

En Neon SQL Editor:

```sql
SELECT id, skill_name, answer, expected_answer, is_correct,
       score, LEFT(ai_feedback, 80) AS feedback_preview, created_at
FROM attempts
ORDER BY id DESC;
```

### Ver mastery actual de una skill

```sql
SELECT skill_name,
       COUNT(*) AS attempts,
       SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS aciertos,
       ROUND(SUM(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END) / COUNT(*), 2) AS mastery
FROM attempts
WHERE student_email = 'carlos.gamer@example.com'
GROUP BY skill_name;
```

---

## RESOURCES — qué hay y cómo verlo

El módulo `resources` no expone endpoints CRUD propios todavía. Los recursos se generan automáticamente cuando se crea un plan: cada unit del plan_json viene enriquecida con un array `resources` de 2-3 entradas (videos, guías, sandboxes).

### Inspeccionar recursos de un plan recién generado

Después de un `POST /learning-paths`, mirar:

```json
"modules": [
  {
    "skill_name": "JavaScript",
    "units": [
      {
        "phase": "pasion",
        "resources": [
          {
            "type": "video",
            "title": "...",
            "url": "https://www.youtube.com/results?search_query=...",
            "source": "FreeCodeCamp",
            "duration_minutes": 60
          },
          ...
        ]
      },
      ...
    ]
  }
]
```

### Listar el catálogo cacheado en BD

```sql
SELECT skill_name, phase, type, title, source, url, generated_by, created_at
FROM resources
WHERE is_active = TRUE
ORDER BY skill_name, phase, id;
```

La primera vez que se pide un plan con una skill nueva, el LLM genera los recursos y los guarda. Planes posteriores con la misma skill reutilizan esos recursos sin volver a llamar al LLM.

### Forzar regeneración de recursos para una skill

Si querés que el sistema sugiera recursos nuevos para una skill (por ejemplo, porque los actuales no te gustaron):

```sql
DELETE FROM resources WHERE skill_name = 'JavaScript';
```

El próximo plan con JavaScript va a disparar la generación de nuevo.

---

## Ver cómo la IA personaliza la respuesta

Los siguientes ejemplos están pensados para ejecutarse en orden y observar cómo **cambia el contenido generado** según el estudiante, sus intereses, la empresa y el rol objetivo. Cada caso usa una skill MISSING para que se generen 3 unidades (pasión, play, práctica).

Después de cada POST, mirar especialmente:

- `generator_used` debería decir `"groq"` o `"gemini"` según `PLAN_GENERATOR` esté seteado en Render (si dice `"mock"`, el LLM falló y cayó al fallback).
- `modules[0].units[0].content` (fase Pasión) debería mencionar **los intereses del estudiante** y **la empresa objetivo**.
- `modules[0].units[2].exercises[]` (fase Práctica) debería tener ejercicios reales con `prompt`, `expected_answer` y `difficulty`.

Detalles más profundos en [ai-integration.md](ai-integration.md).

### Caso A — Frontend Junior con interés en videojuegos

```bash
curl -X POST https://capacity-ar-ap.onrender.com/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "student": {
      "name": "Carlos Mendez",
      "email": "carlos.gamer@example.com",
      "skills": [{"name": "HTML", "level": 3}, {"name": "CSS", "level": 2}],
      "interests": ["videojuegos", "diseño visual", "esports"]
    },
    "company": {"name": "GameStudio Argentina"},
    "target_role": {
      "title": "Frontend Developer Junior",
      "required_skills": [{"name": "JavaScript", "level": 3, "priority": "HIGH"}]
    },
    "summary": "Carlos sabe HTML/CSS pero necesita JavaScript.",
    "readiness_score": 30,
    "skills": [{"name": "JavaScript", "current_level": 1, "required_level": 3, "gap_level": 2, "priority": "HIGH", "status": "MISSING"}]
  }'
```

Qué observar: el contenido de las units debería conectar JavaScript con desarrollo de juegos web o experiencias visuales para esports.

### Caso B — QA Automation con interés en música y podcasts

```bash
curl -X POST https://capacity-ar-ap.onrender.com/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "student": {
      "name": "Lucia Romero",
      "email": "lucia.qa@example.com",
      "skills": [{"name": "Testing manual", "level": 2}],
      "interests": ["música", "podcasts", "comunicación"]
    },
    "company": {"name": "Mercado Pago"},
    "target_role": {
      "title": "QA Automation Junior",
      "required_skills": [{"name": "Selenium", "level": 3, "priority": "HIGH"}]
    },
    "summary": "Lucía sabe testing manual pero necesita automatización.",
    "readiness_score": 25,
    "skills": [{"name": "Selenium", "current_level": 0, "required_level": 3, "gap_level": 3, "priority": "HIGH", "status": "MISSING"}]
  }'
```

Qué observar: el contenido debería conectar la automatización de tests con casos concretos de Mercado Pago, y la narrativa puede ligar con la pasión por la comunicación (los tests "comunican" intención al código).

### Caso C — Data Analyst con interés en fútbol y estadísticas

```bash
curl -X POST https://capacity-ar-ap.onrender.com/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "student": {
      "name": "Joaquin Diaz",
      "email": "joaco.data@example.com",
      "skills": [{"name": "Excel", "level": 4}],
      "interests": ["fútbol", "estadísticas deportivas", "Boca Juniors"]
    },
    "company": {"name": "Globant"},
    "target_role": {
      "title": "Data Analyst Junior",
      "required_skills": [{"name": "SQL", "level": 3, "priority": "HIGH"}]
    },
    "summary": "Joaquín domina Excel, le falta SQL.",
    "readiness_score": 40,
    "skills": [{"name": "SQL", "current_level": 1, "required_level": 3, "gap_level": 2, "priority": "HIGH", "status": "MISSING"}]
  }'
```

Qué observar: los ejemplos en el contenido deberían usar tablas de partidos, jugadores o estadísticas de fútbol; los ejercicios de SQL pueden pedir consultas sobre una hipotética tabla de goles o equipos.

### Caso D — Cloud Junior con interés en sustentabilidad

```bash
curl -X POST https://capacity-ar-ap.onrender.com/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "student": {
      "name": "Sofia Castro",
      "email": "sofi.cloud@example.com",
      "skills": [],
      "interests": ["sustentabilidad", "energías renovables"]
    },
    "company": {"name": "AWS LatAm"},
    "target_role": {
      "title": "Cloud Support Associate",
      "required_skills": [{"name": "AWS EC2", "level": 2, "priority": "HIGH"}]
    },
    "summary": "Sofía arranca de cero en cloud.",
    "readiness_score": 10,
    "skills": [{"name": "AWS EC2", "current_level": 0, "required_level": 2, "gap_level": 2, "priority": "HIGH", "status": "MISSING"}]
  }'
```

Qué observar: la narrativa puede conectar EC2 con cómputo eficiente o impacto del data center, alineando con sustentabilidad. Buen ejemplo de cómo la IA encuentra el puente cuando el interés del estudiante no es obvio para la skill.

### Caso E — Mismo perfil, segundo intento (mostrar variabilidad)

Repetir cualquiera de los anteriores con el mismo body **al menos dos veces seguidas**. Como Gemini tiene `temperature: 0.7`, va a producir contenidos distintos cada vez: distinto título, distintos ejemplos, distintos ejercicios. Es la prueba más clara de que **no es contenido cacheado ni hardcodeado**, sino generado en tiempo real.

```bash
# Mismo body que el Caso A, ejecutado dos veces:
curl -X POST https://capacity-ar-ap.onrender.com/learning-paths \
  -H "Content-Type: application/json" \
  -d '{
    "student": {"name":"Carlos Mendez","email":"carlos.v2@example.com","skills":[],"interests":["videojuegos","esports"]},
    "company": {"name":"GameStudio Argentina"},
    "target_role": {"title":"Frontend Developer Junior","required_skills":[{"name":"JavaScript","level":3,"priority":"HIGH"}]},
    "summary":"Necesita JavaScript",
    "readiness_score":30,
    "skills":[{"name":"JavaScript","current_level":1,"required_level":3,"gap_level":2,"priority":"HIGH","status":"MISSING"}]
  }'
```

### Caso F — Comparar plan mock vs plan gemini

Si en algún momento alguien quiere ver la **diferencia entre los dos generadores** sin tocar Render: cambiar localmente `PLAN_GENERATOR=mock` en `.env`, hacer un POST, ver el contenido placeholder; después `PLAN_GENERATOR=gemini`, repetir, y comparar. El esqueleto del plan es idéntico (mismos módulos, misma cantidad de unidades, mismo orden); solo cambia `title`, `content`, `exercises` y `generator_used`.

### Tiempos esperados

| Cantidad de skills MISSING/NEEDS_WORK | Llamadas paralelas a Gemini | Tiempo aproximado |
|---|---|---|
| 1 | 3 | 5-10 s |
| 2 | 6 | 10-20 s |
| 3 | 9 | 20-30 s |
| 4+ | 12+ | Puede superar 30s (timeout Render free tier) |

Si una respuesta tarda demasiado y Render corta la conexión, el plan **no queda persistido** (la transacción no llega a commitearse). Para casos con muchos skills, ver pendientes en [ai-integration.md](ai-integration.md) sobre evolución a respuesta asincrónica.

### Verificar lo persistido

Después de ejecutar varios casos, en el SQL Editor de Neon:

```sql
SELECT id, student_name, target_role_title, generator_used,
       estimated_total_hours, created_at
FROM learning_paths
ORDER BY id DESC
LIMIT 20;
```

Para inspeccionar el contenido generado de un plan específico (reemplazar `5`):

```sql
SELECT plan_json FROM learning_paths WHERE id = 5;
```

---

## Tips

### Ver status code + headers

```bash
curl -i https://capacity-ar-ap.onrender.com/users/9999
```

El `-i` muestra los headers incluyendo `HTTP/2 404`.

### JSON con formato (requiere `jq`)

```bash
curl -s https://capacity-ar-ap.onrender.com/learning-paths | jq
```

Instalación: `sudo apt install jq` en Ubuntu/Debian, `brew install jq` en Mac.

### Pegar todo desde Swagger en vez de curl

Entrar a https://capacity-ar-ap.onrender.com/docs , clickear el endpoint, "Try it out", editar el JSON y "Execute". Es lo más cómodo para una demo o para probar rápido sin terminal.

---

## Contrato de datos resumido

### Roles de usuario

```
student | tutor | company_admin | admin
```

### GapReport — campos principales

- `student.name`, `student.email`, `student.skills[]`, `student.interests[]`
- `company.name`
- `target_role.title`, `target_role.required_skills[]`
- `summary`, `readiness_score` (0-100)
- `skills[]` con `name`, `current_level`, `required_level`, `gap_level`, `priority`, `status`

### Niveles de skill

```
0 = no declarado
1 = básico
2 = inicial operativo
3 = requerido para junior
4 = intermedio
5 = avanzado
```

### Priority

```
HIGH | MEDIUM | LOW
```

### Status por skill

```
READY       -> gap_level <= 0
NEEDS_WORK  -> gap_level == 1
MISSING     -> gap_level >= 2
```
