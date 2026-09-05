# JobIA Web

Frontend web oficial de JobIA. Este repositorio contiene exclusivamente la experiencia web; el código de producto/app se mantiene en [`raylerr481/JobIA`](https://github.com/raylerr481/JobIA).

## Qué hace

- Dashboard profesional y responsive.
- Búsqueda y ranking de oportunidades.
- Perfil profesional y preferencias.
- Alertas configurables por el usuario.
- Seguimiento de aplicaciones.
- Integración opcional con JobIA API mediante `VITE_JOBIA_API_URL`.
- Fallback seguro a datos demo cuando el backend no está configurado o no responde.

## Arquitectura

```text
BITEY IA
   │
 JobIA
   ├───────────────┐
 Android App    JobIA Web
                  │
             HTTPS / JSON
                  │
              JobIA API
                  │
             Bitey Trainer
                  │
        Supabase / integraciones
```

La web no contiene claves privadas, credenciales de proveedores ni claves `service_role` de Supabase. El navegador sólo consume endpoints públicos/autorizados del API.

## Desarrollo

```bash
npm install
npm run dev
```

Producción:

```bash
npm run build
npm run preview
```

## Backend

Definir en el entorno de despliegue:

```bash
VITE_JOBIA_API_URL=https://tu-api-jobia.example
```

El frontend espera, como contrato inicial, `GET /jobs?q=...` y `PUT /profile`. El contrato puede evolucionar con el JobIA API sin acoplar credenciales al navegador.

## Despliegue

`netlify.toml` ya configura build con Vite, publicación de `dist/` y fallback SPA.

## Principio

JobIA ayuda a **descubrir → hacer match → explicar → preparar → revisar → autorizar**. La automatización no debe saltarse el consentimiento del usuario ni las reglas de una plataforma de empleo.
