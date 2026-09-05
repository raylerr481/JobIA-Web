# JobIA-Web

**Frontend web oficial de JobIA.**

Este repositorio contiene exclusivamente la interfaz web de JobIA. **No contiene el backend principal ni el código de la aplicación Android.**

## Ecosistema JobIA

```text
                    JobIA
              Backend / API / IA
                    │
          ┌─────────┴─────────┐
          │                   │
     JobIA-Web            JobIA App
    Frontend web        App Android
```

- **JobIA** → backend y API de JobIA.
- **JobIA-Web** → este frontend web.
- **JobIA App** → aplicación Android instalable.

JobIA-Web consume los servicios de **JobIA** mediante HTTPS/JSON. No duplica la lógica sensible del backend.

## Funcionalidades

- Dashboard profesional.
- Búsqueda de oportunidades.
- Ranking y explicación de compatibilidad.
- Filtros y preferencias profesionales.
- Oportunidades guardadas.
- Perfil profesional.
- Alertas configurables.
- Seguimiento de aplicaciones.
- Preparación local de CV, cartas y respuestas.
- Diseño responsive para escritorio y móvil.
- Fallback a datos demo cuando la API no está configurada o no responde.

## Contrato con el backend

El frontend puede conectarse al backend mediante:

```bash
VITE_JOBIA_API_URL=https://tu-api-jobia.example
```

El cliente utiliza contratos HTTP del backend de **JobIA**. La URL concreta de producción debe configurarse en el entorno de despliegue y no debe contener secretos.

El frontend no debe incluir:

- Claves privadas de proveedores.
- Credenciales de base de datos.
- Claves `service_role` de Supabase.
- Secretos de integración.
- Lógica que deba permanecer protegida en el backend.

## Flujo de usuario

```text
Buscar → Explorar → Hacer match → Entender → Guardar
                                      ↓
                                  Preparar
                                      ↓
                              Revisar y autorizar
```

JobIA-Web prepara y presenta información para el usuario. No debe enviar candidaturas automáticamente sin consentimiento ni saltarse las reglas de plataformas externas.

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Servidor de desarrollo:

```bash
npm run dev
```

Verificación de producción:

```bash
npm run build
```

Vista previa:

```bash
npm run preview
```

## Build y despliegue

El proyecto utiliza Vite y está preparado para despliegue estático. `dist/` es el directorio generado para producción.

La configuración de Cloudflare Pages se encuentra en `wrangler.toml`. La configuración de CI se encuentra en `.github/workflows/build.yml`.

El build debe pasar `tsc -b` y `vite build` antes de considerar una versión lista para despliegue.

## Arquitectura de frontend

```text
React + TypeScript
        │
      Vite
        │
   JobIA-Web
        │
   HTTPS / JSON
        │
     JobIA API
        │
 Backend / IA / datos
```

La aplicación mantiene funcionalidades locales como preferencias, oportunidades guardadas y borradores de aplicación cuando corresponde, pero el backend de referencia sigue siendo **JobIA**.

## Relación con JobIA App

**JobIA App es un cliente independiente para Android.** No forma parte de este repositorio. Ambos clientes utilizan el backend JobIA, pero sus interfaces y ciclos de desarrollo permanecen separados.

## Principio

> **JobIA es el backend. JobIA-Web es el frontend web. JobIA App es la aplicación Android. Tres repositorios independientes, un mismo producto JobIA.**
