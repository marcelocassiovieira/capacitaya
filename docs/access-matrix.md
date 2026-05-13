# Matriz De Accesos

Define que rol puede hacer que en el sistema. Sirve para:

- Disenar endpoints respetando permisos desde el dia 1.
- Que el frontend sepa que pantallas mostrar a cada rol.
- Implementar auth cuando llegue el momento sin rediseñar.

## Roles

| Rol | Quien |
|---|---|
| `student` | Estudiante que cursa la capacitacion |
| `tutor` | Acompanante humano de un grupo de estudiantes |
| `company_admin` | Referente de una empresa con ofertas laborales |
| `admin` | Operacion interna de la plataforma |

## Convenciones

- `ALL` -> acceso total
- `OWN` -> solo lo propio (su perfil, sus datos)
- `READ` -> solo lectura
- `WRITE_OWN` -> escritura solo sobre lo propio
- `WRITE_ASSIGNED` -> escritura solo sobre estudiantes asignados (tutor)
- `NONE` -> sin acceso

Nota: Para el MVP, la empresa NO ve informacion del avance de estudiantes. Solo carga ofertas y nada mas. La visibilidad de la empresa sobre aplicantes queda para post-MVP.

## Matriz Por Entidad

### Cuenta propia

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Ver mi perfil | OWN | OWN | OWN | ALL |
| Editar mi perfil | OWN | OWN | OWN | ALL |

### Empresas

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Listar empresas | READ | READ | OWN | ALL |
| Ver empresa | READ | READ | OWN | ALL |
| Crear empresa | NONE | NONE | ALL | ALL |
| Editar empresa | NONE | NONE | OWN | ALL |

### Ofertas y posiciones

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Listar ofertas | READ | READ | OWN | ALL |
| Crear oferta | NONE | NONE | ALL | ALL |
| Editar oferta | NONE | NONE | OWN | ALL |

### Estudiantes

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Listar estudiantes | NONE | READ (asignados) | NONE | ALL |
| Ver perfil estudiante | OWN | READ (asignados) | NONE | ALL |
| Crear estudiante | NONE | NONE | NONE | ALL (via form Google) |

### Gap Report

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Ver mi gap | OWN | READ (asignados) | NONE | ALL |
| Generar gap | NONE | NONE | NONE | ALL (auto al elegir oferta) |

### Learning Path

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Ver mi path | OWN | READ (asignados) | NONE | ALL |
| Avanzar en path (ejercicios) | OWN | NONE | NONE | NONE |
| Modificar path | NONE | WRITE_ASSIGNED | NONE | ALL |

### Sesiones y attempts

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Crear sesion / intentar ejercicio | OWN | NONE | NONE | NONE |
| Ver historial de intentos | OWN | READ (asignados) | NONE | ALL |

### Tutores

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Listar tutores | NONE | READ | NONE | ALL |
| Asignar tutor a estudiante | NONE | NONE | NONE | ALL |

### Alertas (riesgo abandono, frustracion, etc.)

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Ver alertas | NONE | READ (asignados) | NONE | ALL |
| Resolver alerta | NONE | WRITE_ASSIGNED | NONE | ALL |

Nota: el estudiante NO ve sus propias alertas. Si las viera el sistema perderia su rol motivacional.

### Validaciones criticas

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Subir entregable | OWN | NONE | NONE | NONE |
| Validar entregable | NONE | WRITE_ASSIGNED | NONE | ALL |
| Ver feedback | OWN | READ (los que valido) | NONE | ALL |

### Metricas

| Accion | Student | Tutor | Empresa | Admin |
|---|---|---|---|---|
| Ver mi progreso | OWN | NONE | NONE | NONE |
| Ver progreso de mis asignados | NONE | READ | NONE | ALL |
| Ver metricas globales del sistema | NONE | NONE | NONE | ALL |

## Reglas Que Se Desprenden

1. El estudiante solo se ve a si mismo. No conoce a otros estudiantes ni tutores.
2. El tutor solo ve a sus asignados. No puede meterse en estudiantes ajenos.
3. La empresa para MVP NO ve avance de estudiantes. Solo carga sus ofertas.
4. El admin ve y puede todo. Es el rol operativo.
5. Solo el estudiante puede avanzar en su propio path.
6. El tutor puede modificar el path del asignado (agregar refuerzo, saltar unidad).
7. Las alertas son internas. El estudiante no las ve.

## Casos Delicados

### A - Visibilidad de la empresa sobre el aprendizaje

Para MVP, la empresa NO ve avance de estudiantes. Solo carga sus ofertas.

Para post-MVP, la empresa podra ver un RESUMEN del path del aplicante (% completado, habilidades dominadas), no el detalle de intentos. Para cuidar la dignidad del aprendiz y no exponer sus dificultades al futuro empleador.

### B - Score numerico al estudiante

El estudiante NO ve el `readiness_score` numerico crudo. Ve el progreso en terminos motivacionales:

```text
"Dominaste 3 de 7 habilidades"
"Te faltan 2 ejercicios para dominar SQL"
```

El score numerico queda para tutor, empresa y admin.

### C - Cambio de tutor por parte del estudiante

Para MVP el estudiante no puede pedir cambio de tutor. Funcionalidad post-MVP.

### D - Multiples company_admin por empresa

Para MVP, todos los company_admin de una misma empresa tienen los mismos permisos. A futuro pueden haber niveles (supervisor, recruiter, etc.).

## Implementacion En Codigo

En MVP sin login, se simula el usuario con headers:

```text
X-User-Id: 1
X-User-Role: student
```

Cada endpoint se marca con el rol o roles requeridos. Sugerencia inicial:

```python
@router.get("/learning-paths/{id}")
# allowed: student:own | tutor:assigned | company_admin:applicants | admin:all
def get_learning_path(id: int):
    ...
```

Cuando se sume `auth/`, se reemplaza el header mock por un decoder JWT que llena `current_user` con role y permisos. Los chequeos quedan iguales.

## Resumen

- 4 roles definidos.
- Visibilidad estricta por defecto.
- Sin login en MVP, pero con la matriz aplicable apenas se sume `auth/`.
- El estudiante ve solo lo propio, en terminos motivacionales.
- Las alertas son internas para tutor y admin, nunca para el estudiante.
