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
