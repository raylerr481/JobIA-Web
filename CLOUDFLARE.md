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

## Arquitectura de publicación

```text
Cloudflare Pages
       │
       ▼
    JobIA Web
       │ HTTPS/JSON
       ▼
    JobIA API
       │
       ▼
  Bitey Trainer
       │
       ▼
    Supabase
```

El frontend no contiene secretos ni hace envíos automáticos de candidaturas. La autorización de acciones externas permanece bajo control del usuario.
