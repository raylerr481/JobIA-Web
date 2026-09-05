# Publicar JobIA Web en Cloudflare Pages

## Opción recomendada: conexión directa con GitHub

Repositorio: `raylerr481/JobIA-Web`

Configuración de Cloudflare Pages:

- Framework preset: `Vite`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 22 o una versión LTS compatible
- Variable pública opcional: `VITE_JOBIA_API_URL`

No coloques claves privadas, tokens de proveedores ni claves de Supabase en variables `VITE_*`. Todo lo que empieza por `VITE_` termina expuesto al navegador.

## Opción por Wrangler

El repositorio incluye `wrangler.toml` con `pages_build_output_dir = "dist"`.

Flujo local:

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name jobia-web
```

El frontend funciona sin backend mediante el modo demo local. Cuando `VITE_JOBIA_API_URL` está configurada, intenta usar el JobIA API y conserva un fallback seguro al modo demo si el API no responde.

## Arquitectura real del ecosistema

JobIA Web y Bitey IA Web son productos/webs independientes. JobIA Web es el cliente especializado de empleo y trabajo; no se convierte en una página de Bitey ni se fusiona con `bitey-web`.

```text
┌───────────────────────┐       ┌────────────────────────┐
│    Bitey IA Web       │◄─────►│   JobIA especialidad   │
│  inteligencia general │       │ empleo y trabajo       │
│  orquestación/modelos │       │ API contract jobia-v1  │
└──────────┬────────────┘       └───────────┬────────────┘
           │                                │
           │ Bitey Trainer                 │
           │ modelo/capacidad interna      │
           ▼                                ▼
┌───────────────────────┐       ┌────────────────────────┐
│  entrenamiento y      │       │ JobIA Web / JobIA App  │
│  validación de        │       │ productos independientes│
│  capacidades          │       │ clientes de JobIA      │
└───────────────────────┘       └────────────────────────┘
```

La relación es por contratos versionados y APIs, no por acoplamiento de interfaces. Bitey IA Web puede delegar una solicitud a JobIA cuando requiere conocimiento o acciones de empleo; JobIA puede solicitar capacidades generales de Bitey cuando necesita razonamiento, orquestación, memoria, herramientas o políticas generales.

Bitey Trainer es una capacidad/modelo interno de Bitey IA Web para entrenamiento, evaluación y validación. No es un cliente web, no sustituye a JobIA y no debe tratarse como un segundo cerebro independiente.

## Seguridad

El frontend no contiene secretos ni hace envíos automáticos de candidaturas. La autorización de acciones externas permanece bajo control del usuario.
