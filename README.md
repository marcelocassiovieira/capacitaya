# Capacitaya

Plataforma de aprendizaje adaptativo orientada a reducir la brecha entre secundaria y mercado laboral IT.

Stack:

- **Backend**: Python 3.12, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: React 19, Vite, Tailwind CSS
- **Deploy**: Render (backend + frontend como estático) + Neon (PostgreSQL serverless)

---

## Estructura del proyecto

```text
app/                          # Backend FastAPI
  main.py
  config.py
  database.py
  modules/
    users/
    learning_paths/
    attempts/
    resources/
    job_descriptions/

frontend/
  artifacts/
    capacitaya/               # App React/Vite (standalone)
      src/
      public/
      package.json
      vite.config.ts
      Dockerfile
```

### Organización del backend (por módulo)

Cada módulo sigue capas con responsabilidad única:

- `router.py` — endpoints HTTP y dependencias FastAPI
- `service.py` — reglas de negocio y manejo de errores
- `repository.py` — acceso a datos con SQLAlchemy
- `models.py` — modelos y tablas
- `schemas.py` — contratos Pydantic de entrada/salida

---

## Desarrollo local con Docker

Es la forma recomendada. Levanta el backend, el frontend, la base de datos y pgAdmin con un solo comando.

```bash
cp .env.example .env
docker compose up
```

| Servicio | URL |
|---|---|
| Backend (API) | http://localhost:8000 |
| Frontend | http://localhost:3000 |
| Documentación de endpoints (Swagger) | http://localhost:8000/docs |
| pgAdmin | http://localhost:8888 |

El frontend usa hot-reload: los cambios en `frontend/artifacts/capacitaya/src/` se reflejan en el browser sin reiniciar el contenedor.

Para reconstruir las imágenes (por ejemplo, al agregar dependencias npm o pip):

```bash
docker compose up --build
```

---

## Desarrollo local sin Docker

### Backend

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Para usar SQLite en lugar de PostgreSQL, poner en `.env`:

```env
DATABASE_URL=sqlite:///./capacity_ar_local.db
```

### Frontend

```bash
cd frontend/artifacts/capacitaya
npm install
PORT=3000 BASE_PATH=/ npm run dev
```

---

## Deploy en Render

El deploy es automático desde la branch `main` vía webhook de GitHub.

### Qué hace Render al deployar

1. Instala Node.js (vía Nix)
2. Instala dependencias npm y hace el build del frontend (`npm run build`)
3. Instala dependencias Python
4. Inicia el servidor con uvicorn

El frontend queda compilado como archivos estáticos en `frontend/artifacts/capacitaya/dist/public/` y FastAPI los sirve directamente. Las rutas de API viven bajo `/api/*`.

### Variables de entorno en Render

Configurar en **Environment** del Web Service (no en `render.yaml`):

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL externa del PostgreSQL (Neon u otro). La app normaliza `postgres://` a `postgresql+psycopg://` automáticamente. |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `PLAN_GENERATOR` | `groq` o `gemini` (default: `mock` si no se setea) |
| `GROQ_API_KEY` | API key de Groq |
| `GEMINI_API_KEY` | API key de Google Gemini |
| `PORT` | 3000 (de FastAPI) |
### Base de datos

Las tablas se crean automáticamente al iniciar la app con `Base.metadata.create_all`. Cuando el modelo empiece a cambiar con datos reales en producción, el siguiente paso es sumar Alembic para migraciones.

---

## Buenas prácticas para este MVP

- Módulos por capacidad de negocio, no por tipo técnico global.
- Reglas de negocio en `service.py`, nunca en routers.
- SQLAlchemy aislado en `repository.py`.
- Auth diferida intencionalmente hasta cerrar el flujo mínimo.
- `create_all` sólo en MVP; migraciones con Alembic cuando haya cambios de schema en producción.
