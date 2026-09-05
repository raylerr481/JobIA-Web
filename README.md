# JobIA-Web

**Web oficial e independiente de JobIA**, la plataforma especializada en empleo y trabajo del ecosistema Bitey.

Este repositorio contiene exclusivamente la interfaz web de JobIA. No contiene el backend de JobIA ni la aplicación Android. **JobIA-Web tiene su propia identidad y web; Bitey IA Web tiene su propia web independiente.**

## Arquitectura

```text
                 BITEY IA WEB
          inteligencia general / núcleo
                    │     ▲
       contiene    │     │ capacidades generales
       Bitey       │     │
       Trainer     ▼     │
              ┌──────────────┐
              │    JobIA     │
              │ especialidad │
              │ empleo/trabajo│
              └──────┬───────┘
                     │ jobia-v1
              ┌──────┴─────────┐
              ▼                ▼
         JobIA-Web         JobIA-app
            Web              Android
```

- `bitey-web` → producto/web de Bitey IA Web, inteligencia general, memoria, herramientas, políticas y orquestación.
- `bitey-trainer` → modelo/capacidad interna de Bitey IA Web para entrenamiento, evaluación y validación; no es una segunda web ni un cliente.
- `JobIA` → producto/backend especializado de empleo, contrato `jobia-v1`.
- `JobIA-Web` → web independiente de JobIA.
- `JobIA-app` → aplicación Android independiente de JobIA.

## Relación entre las capacidades

JobIA-Web y JobIA-app dependen del desarrollo y las capacidades que proporciona Bitey IA Web, incluido Bitey Trainer, pero mantienen su propia interfaz y ciclo de producto.

La comunicación entre productos se realiza mediante contratos versionados y APIs. No existe acoplamiento directo entre las interfaces de Bitey-Web y JobIA-Web.

El flujo puede ser bidireccional:

```text
Bitey IA Web ── solicitud de empleo/trabajo ──► JobIA
Bitey IA Web ◄─ resultado especializado ─────── JobIA

JobIA ── necesita razonamiento general ─────────► Bitey IA Web
JobIA ◄─ capacidad general/orquestación ───────── Bitey IA Web

Bitey Trainer ── capacidades validadas ─────────► JobIA
```

## Contrato backend

Configura:

```bash
VITE_JOBIA_API_URL=https://tu-backend-jobia.example
```

Endpoints principales consumidos por el frontend:

- `GET /health`
- `GET /jobs`
- `GET /jobs/{job_id}`
- `GET /profile`
- `PUT /profile`
- `GET /api/v1/capabilities`
- `GET /api/v1/module/status`
- `GET /api/v1/contract`

El cliente puede mantener estado local para UX, pero las capacidades de producto de JobIA pertenecen al backend `JobIA`.

## Funcionalidades

- Dashboard profesional.
- Búsqueda y filtros de oportunidades.
- Ranking y explicación de compatibilidad.
- Perfil profesional.
- Guardados.
- Alertas.
- Seguimiento de aplicaciones.
- Preparación de CV, cartas y respuestas.
- Responsive desktop/mobile.
- Fallback demo cuando el backend no está configurado o disponible.

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

> **Bitey IA Web y JobIA son productos independientes; Bitey Trainer es una capacidad/modelo interno de Bitey IA Web; JobIA-Web y JobIA-app son las interfaces independientes de JobIA.**
