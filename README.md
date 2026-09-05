# JobIA-Web

**Frontend web oficial de JobIA**, el módulo de empleo de **Bitey IA Web**.

Este repositorio contiene exclusivamente la interfaz web. No contiene el backend ni la aplicación Android.

## Arquitectura

```text
                         BITEY IA WEB
                    inteligencia general
                           │
                           ▼
                    JobIA Backend
                  módulo de empleo
                           │
                    HTTPS / JSON
                  ┌────────┴────────┐
                  ▼                 ▼
             JobIA-Web         JobIA-app
             Web frontend        Android
```

- `bitey-web` → cerebro general, memoria, herramientas, políticas y orquestación.
- `JobIA` → backend especializado de empleo, contrato `jobia-v1`.
- `JobIA-Web` → este frontend web.
- `JobIA-app` → cliente Android independiente.
- `bitey-trainer` → entrenamiento y validación interna de inteligencia para JobIA.

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

El frontend puede mantener estado local para UX, pero la fuente de servicios de JobIA es el backend `JobIA`.

## Relación con Bitey IA Web

JobIA-Web no implementa el cerebro general. Cuando una capacidad requiere razonamiento/orquestación de Bitey, el flujo conceptual es:

```text
Usuario → JobIA-Web → JobIA API → Bitey IA Web / Trainer / herramientas
                                  ↓
                            resultado validado
                                  ↓
                              JobIA-Web
```

Los clientes nunca reciben secretos de proveedores ni claves privadas de infraestructura.

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

> **Bitey IA Web es la inteligencia general; JobIA es el módulo especializado de empleo; JobIA es el backend compartido; JobIA-Web y JobIA-app son clientes independientes.**
