# Capacity AR API

Backend MVP para una plataforma de aprendizaje adaptativo orientada a reducir la brecha entre secundaria y mercado laboral IT.

Stack inicial:

- Python 3.12
- FastAPI
- Uvicorn
- PostgreSQL
- SQLAlchemy
- Render

## Modelo mental desde Spring Boot

- `router.py`: Controller
- `service.py`: Service
- `repository.py`: Repository
- `models.py`: Entity
- `schemas.py`: DTO request/response
- `database.py`: datasource/session factory
- FastAPI + Uvicorn: aplicación web + servidor HTTP/ASGI

## Estructura

```text
app/
  main.py
  config.py
  database.py
  modules/
    users/
      router.py
      service.py
      repository.py
      models.py
      schemas.py
```

## Ejecutar local

1. Crear entorno virtual:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
```

2. Instalar dependencias:

```bash
pip install -r requirements.txt
```

3. Configurar variables:

```bash
cp .env.example .env
```

4. Para probar sin instalar PostgreSQL, usar SQLite como base embebida local:

```env
DATABASE_URL=sqlite:///./capacity_ar_local.db
```

Si querés probar contra PostgreSQL local, crear una base `capacity_ar` y usar:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/capacity_ar
```

5. Levantar API:

```bash
uvicorn app.main:app --reload
```

Endpoints útiles:

- `GET /health`
- `GET /docs`
- `POST /users`
- `GET /users`
- `GET /users/{id}`
- `PATCH /users/{id}`
- `DELETE /users/{id}`

Ejemplo:

```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Perez","email":"ana@example.com","role":"student"}'
```

## Deploy en Render

Crear un PostgreSQL gestionado en Render y luego un Web Service apuntando a este repo.

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Variables:

- `DATABASE_URL`: external/internal database URL de Render PostgreSQL. La app normaliza URLs `postgres://...` o `postgresql://...` al driver `postgresql+psycopg://...`.
- `APP_ENV=production`
- `APP_DEBUG=false`

Para MVP, las tablas se crean al iniciar la app con `Base.metadata.create_all`. Cuando el modelo empiece a cambiar con datos reales, el siguiente paso razonable es sumar Alembic.

## Buenas prácticas mínimas para este MVP

- Mantener módulos por capacidad de negocio, no por tipo técnico global.
- Poner reglas de negocio en `service.py`; no en routers.
- Dejar SQLAlchemy aislado en repositorios.
- No agregar auth hasta cerrar el flujo mínimo de usuarios y onboarding.
- Usar `create_all` sólo en MVP; migraciones con Alembic cuando haya cambios de schema en ambientes persistentes.
