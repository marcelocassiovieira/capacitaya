# 🚀 Plataforma de Análisis de Brecha - CapacitaYa

Bienvenidos al repositorio central del proyecto. Este documento funciona como nuestra **bitácora de sincronización activa** y mapa metodológico. Está diseñado para que todo el equipo (owner, desarrolladores, QA y perfiles de gestión/no-programadores) entienda qué se está haciendo, qué tecnologías elegimos y cómo se estructuran las tareas entre el Frontend y el Backend.

---

## 📌 1. Visión del MVP y Sincronización del Equipo

Inicialmente planteamos el desarrollo divididos en 3 equipos independientes (uno por módulo). Ante la necesidad de maximizar la eficiencia y adaptarnos a un equipo activo de **6 integrantes que rotamos por cuestiones laborales y personales (más apoyo)**, nos fusionamos en un **único equipo de desarrollo enfocado en un MVP Funcional**.

### El Flujo del Negocio del MVP:
1. **Entrada:** Se recolectan las habilidades de alumnos de escuelas vulnerables (último año de secundaria) mediante formularios de diagnóstico.
2. **Brecha de Mercado:** CAME nos provee informes estructurados con las necesidades de contratación de las PYMES.
3. **Procesamiento (IA):** Cruzamos ambos datos para identificar los "gaps" técnicos. La IA genera una **Ruta de Aprendizaje (Learning Path)** personalizada.
4. **Capacitación y Monitoreo:** El Alumno estudia su ruta estructurada, el Tutor supervisa el progreso de múltiples estudiantes, y CAME visualiza métricas globales del impacto.

---

## 🛠️ 2. Stack Tecnológico Consolidado (Explicado en Simple)

Para garantizar un desarrollo ágil y ordenado, la plataforma se divide en dos grandes bloques de código que se comunican entre sí a través de internet:

### A. Frontend (La Interfaz Visual)
Ubicado en el repositorio de interfaz, está estructurado como un **Monorepo** administrado por **pnpm** (una herramienta avanzada que gestiona múltiples subproyectos en un solo lugar de forma ultra veloz). Sus tecnologías principales son:
* **Aplicación del Usuario (`artifacts/capacitaya`):** Construida con **React** bajo el empaquetador moderno **Vite** (no utiliza Next.js). Esto permite una navegación fluida y rápida en las pantallas.
* **Lenguaje:** Código escrito en **TypeScript**, una extensión de JavaScript que añade tipado estático estricto. Su función es ayudar a los desarrolladores con experiencia a detectar errores antes de que las pantallas se publiquen.
* **Diseño y Componentes Visuales:** La estética se maneja con **Tailwind CSS** y componentes listos de la librería **shadcn/ui** (gracias a esto ya contamos con elementos profesionales como barras de progreso, acordeones, tablas y tarjetas).
* **Servidor Local y Herramientas de Apoyo:** El entorno incluye un servidor API auxiliar en Node.js (`artifacts/api-server`) y esquemas de datos con **Drizzle ORM** (`lib/db`) utilizados localmente en Replit para autogenerar los contratos de comunicación y las pruebas estáticas.

### B. Backend (El Motor Lógico)
* **Tecnología Core:** Desarrollado en **Python** utilizando el framework **FastAPI**. Es el encargado de procesar la lógica de negocio profunda y conectarse de manera segura con los modelos de Inteligencia Artificial.
* **Base de Datos y Persistencia:** Para el MVP actual **no se utilizará un motor de base de datos relacional externo**. El sistema implementa una arquitectura **In-Memory (En Memoria)** en el backend, ideal para agilizar las pruebas funcionales unificadas sin configuraciones pesadas de infraestructura. Como alternativa de persistencia y análisis de documentos para fases posteriores, se evalúa la implementación de una arquitectura **RAG (Retrieval-Augmented Generation)**.
* **Despliegue en la Nube (Render):** Utilizamos **Render** para alojar el motor del Backend (Python) en internet de forma pública. Render actúa como el servidor que mantiene la lógica de la IA "encendida" en la nube para que las pantallas de Replit puedan enviarle y pedirle datos mediante llamadas directas (cables de red).

### Estrategia de IA (Multi-Modelo en Backend):
El motor interno cuenta con una estructura flexible (Factory Pattern) que permite cambiar entre **Gemini** y **Groq** modificando una sola variable de entorno. Esto nos permite seguir operando si se agotan los tokens gratuitos de un proveedor durante las pruebas de la aplicación.

### Simulaciones (Hardcodeo en Frontend):
Para validar la experiencia de usuario sin complejizar el código de backend en esta fase, las siguientes interacciones se resolverán de forma cableada/simulada directamente en las vistas de React:
* El inicio de sesión (Login) y la simulación de roles.
* El Panel del Tutor controlando a varios alumnos asignados.
* El Panel de Métricas Globales para CAME.

---

## 📑 3. Mapa de Épicas, Historias de Usuario e Issues (Análisis Funcional)

*Nota: Hemos sincronizado y depurado el backlog técnico e histórico. Las tareas se clasifican bajo criterios funcionales de valor de usuario. Los elementos técnicos que no aplican al MVP actual se han trasladado a la hoja de ruta futura para mantener limpio el foco del equipo.*

### [ÉPICA 1] Experiencia del Alumno (Panel de Estudio)
> **Definición Funcional:** Como alumno de último año de escuela secundaria, quiero completar un diagnóstico y visualizar mi trayecto formativo personalizado para adquirir las habilidades demandadas por el mercado.

* **HU-1.1: Diagnóstico de Habilidades**
  * *Descripción:* Permitir al estudiante ingresar su perfil sociodemográfico y competencias iniciales.
  * ⚠️ *Issue/Tarea (Front - Pendiente):* Diseñar la pantalla de formulario de carga de datos del estudiante en Replit para capturar las respuestas iniciales.
* **HU-1.2: Panel de Estudio (Curso Estructurado)**
  * *Descripción:* Visualizar de forma gráfica e interactiva la ruta paso a paso sugerida por la IA.
  * ✅ **Realizado (Back):** Endpoint base de `learning_paths` que recibe el perfil y procesa la ruta con IA.
  * ✅ **Realizado (Front):** Maquetada la interfaz visual de la ruta del alumno (`PlanCapacitacion.tsx` / `ModuloIA.tsx`), mostrando el itinerario en módulos secuenciales y sus recursos interactivos con datos fijos.

### [ÉPICA 2] Panel del Tutor (Seguimiento Individual)
> **Definición Funcional:** Como tutor pedagógico, quiero supervisar el estado de avance y las entregas de mis alumnos asignados para garantizar su continuidad y conectividad con las empresas.

* **HU-2.1: Panel Multi-Alumno del Tutor**
  * *Descripción:* Visualizar una lista consolidada de estudiantes a cargo con sus respectivos estados e indicadores de coincidencia corporativa.
  * ✅ **Realizado (Front):** Construcción de la interfaz base del tutor (`PanelTutor.tsx` / `CanalTutor.tsx`) donde se aprecia el listado simulado de estudiantes a cargo y el porcentaje de avance cableado.
* **HU-2.2: Control de Consignas (Attempts)**
  * *Descripción:* Revisar los resultados de los exámenes o consignas enviados por los alumnos para brindar retroalimentación.
  * ✅ **Realizado (Back):** Estructura del servicio de intentos (`attempts`) listo para registrar calificaciones y feedbacks en el backend.
  * ⚠️ *Issue/Tarea (Front - Pendiente):* Diseñar e integrar componentes visuales en la vista de detalle (`DetalleCandidato.tsx`) para listar de manera amigable las notas, feedbacks e intentos entregados por el alumno.

### [ÉPICA 3] Monitoreo Estratégico (Dashboard CAME)
> **Definición Funcional:** Como representante de la Cámara Empresaria (CAME), quiero observar métricas consolidadas sobre la reducción de la brecha de habilidades para evaluar el impacto de la inserción laboral.

* **HU-3.1: Pantalla de Métricas Globales**
  * *Descripción:* Acceder a un panel macro con indicadores agregados del rendimiento del programa.
  * ✅ **Realizado (Front):** Diseñada la interfaz del Dashboard para CAME (`Dashboard.tsx`) mostrando los indicadores macro (alumnos activos, porcentaje de match promedio del programa) utilizando datos estáticos cableados en los componentes.

### [ÉPICA 4] Gestión de Demandas y Empresas (En Reserva para Fase 1)
> **Definición Funcional:** Como analista del proyecto, quiero estructurar las necesidades de las PYMES asociadas a CAME para que sirvan de insumo al motor de IA.

* **HU-4.1: Integración de Informe Estructurado CAME**
  * *Descripción:* Disponer de los requerimientos corporativos de habilidades para contrastarlos con los perfiles de los estudiantes.
  * ⚠️ *Issue/Tarea (Back - Pendiente / Si el tiempo lo permite):* Crear el endpoint para recibir o almacenar en memoria el archivo estructurado de búsquedas de empresas según lo listado en el backlog histórico.
  * ⚠️ *Issue/Tarea (Front - Pendiente / Si el tiempo lo permite):* Diseñar la vista estática o formulario para que las empresas asociadas puedan visualizar o simular la entrega de sus informes estructurados de habilidades requeridas.

### [ÉPICA 5] Infraestructura y Motor de IA (Fase Inicial Completada)
> **Definición Funcional:** Como equipo técnico, requerimos un motor de IA modular que garantice la generación de las rutas y la continuidad del servicio ante fallas de tokens.

* **HU-5.1: Integration y Factoría de APIs**
  * ✅ **Realizado (Back):** Investigación técnica de APIs y diseño del Prompt System inicial (`app/modules/learning_paths/plan_generator/`).
  * ✅ **Realizado (Back):** Implementación de la Factory para intercambio en caliente de proveedores de IA (Gemini / Groq / Mocks de prueba).

---

## 🔮 4. Plan de Implementación Futuro (Fuera de Alcance del MVP Actual)

Las siguientes iniciativas técnicas y de automatización extraídas del diseño histórico se han postergado formalmente para etapas posteriores con el fin de priorizar la entrega del MVP funcional cableado:
1. **Automatizaciones No-Code (`n8n` / `Make`):** Configuración de flujos con Webhooks para capturar información desde Google Forms externos.
2. **Infraestructura Relacional y Persistencia Completa:** Configuración de bases de datos relacionales físicas (PostgreSQL) junto con el sistema de migraciones automáticas de Alembic, o pasaje a arquitecturas basadas en índices vectoriales para el RAG.

---

## 🛠️ 5. Guía de Trabajo para el Equipo

1. **Si eres Dev / Diseñador Front:** Tu foco está en las pantallas de Replit utilizando React y TypeScript. Debemos refinar la navegación entre las vistas ya creadas (Alumno, Tutor, CAME) y conectar el formulario de diagnóstico con el backend de Render.
2. **Si eres QA / No programador:** El código visual ya cuenta con datos de prueba cargados. Puedes ingresar al sandbox de Replit para validar los flujos de navegación, verificar que los gráficos del Dashboard se entiendan claramente y confirmar que la vista secuencial del curso del alumno sea intuitiva. Asimismo, se pueden testear las respuestas de la IA en el backend desplegado en Render usando Postman.
