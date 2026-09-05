# JobIA-Web

**Canal web oficial de JobIA.**

JobIA es el módulo especializado de empleo y trabajo de **Bitey IA**. Este repositorio contiene exclusivamente su canal web. No contiene el backend de JobIA ni la aplicación Android.

## Arquitectura

```text
                         BITEY IA
                    inteligencia general
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       JobIA          Bitey SBT       otros módulos
    empleo/trabajo      trading
       módulo
          │
     ┌────┴─────┐
     │          │
 JobIA-Web   JobIA-app
    Web        Android
   canal        canal

Bitey IA Web = canal web de Bitey IA
```

- `bitey-web` → canal web de Bitey IA.
- `JobIA` → módulo/backend especializado de empleo de Bitey IA.
- `JobIA-Web` → canal web de JobIA.
- `JobIA-app` → canal Android de JobIA.
- `bitey-trainer` → capacidad interna de Bitey IA para entrenamiento, evaluación y validación.

JobIA-Web y Bitey IA Web tienen interfaces propias, pero no son dos cerebros ni deben acoplarse entre sí directamente. La comunicación entre Bitey IA y JobIA se realiza mediante APIs y contratos versionados.

## Relación de capacidades

```text
Bitey IA / Bitey IA Web
        │
        │ tarea especializada de empleo
        ▼
      JobIA
        │
        ├── JobIA-Web
        └── JobIA-app

JobIA ── necesita capacidad general ──► Bitey IA
Bitey Trainer ── valida capacidades ─► JobIA
```

## Contrato backend

Configura:

```bash
VITE_JOBIA_API_URL=https://tu-backend-jobia.example
```

Endpoints principales:

- `GET /health`
- `GET /jobs`
- `GET /jobs/{job_id}`
- `GET /profile`
- `PUT /profile`
- `POST /applications/prepare`
- `GET /api/v1/capabilities`
- `GET /api/v1/module/status`
- `GET /api/v1/contract`

El backend `JobIA` es la autoridad para la inteligencia especializada. El frontend no debe duplicar matching, ranking o preparación de aplicaciones en producción.

## Funcionalidades

- Dashboard profesional.
- Búsqueda y filtros de oportunidades.
- Ranking y explicación de compatibilidad.
- Perfil profesional.
- Guardados.
- Alertas.
- Seguimiento de aplicaciones.
- Preparación de CV, cartas y respuestas mediante JobIA.
- Responsive desktop/mobile.
- Fallback demo únicamente para desarrollo/offline.

## Seguridad

Nunca incluir en el navegador:

- claves privadas de proveedores;
- credenciales de base de datos;
- `service_role` de Supabase;
- secretos de integración.

Las acciones externas sensibles requieren consentimiento del usuario.

## Desarrollo

```bash
npm install
npm run dev
npm run build
npm run preview
```

El build de producción debe pasar TypeScript y Vite antes del despliegue.

## Principio

> **Bitey IA es el sistema general. JobIA es un módulo especializado de empleo. JobIA-Web es el canal web de ese módulo. JobIA-app es su canal Android. Bitey IA Web es el canal web del sistema general.**
