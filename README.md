# JobIA-Web

**Official web channel of JobIA.**

JobIA is the specialized employment and work module of **Bitey IA**. This repository contains only its web channel. It does not contain the JobIA backend or the Android application.

## Language and naming standard

All repository documentation, API contracts, frontend/backend references, variable names, TypeScript types, JSON keys, query parameters, configuration keys, and internal technical identifiers must use **English**.

The user interface may support Spanish, Portuguese, English, and other localized languages, but technical identifiers must remain English and stable across channels.

Examples: `job_id`, `company`, `location`, `modality`, `kind`, `skills`, `match`, `application`, `VITE_JOBIA_API_URL`.

Do not introduce Spanish variable names, JSON keys, API parameters, or internal identifiers in new code.

## Architecture

```text
                         BITEY IA
                    general intelligence
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       JobIA          Bitey SBT       other modules
    employment/work      trading
       module
          │
     ┌────┴─────┐
     │          │
 JobIA-Web   JobIA-app
    Web        Android
   channel      channel

Bitey IA Web = web channel of Bitey IA
```

- `bitey-web` → web channel of Bitey IA.
- `JobIA` → specialized employment/work module and backend API `jobia-v1`.
- `JobIA-Web` → web channel of JobIA.
- `JobIA-app` → Android channel of JobIA.
- `bitey-trainer` → internal Bitey IA capability for training, evaluation, and validation.

JobIA-Web and Bitey IA Web have independent interfaces, but they are channels rather than separate brains. Communication between Bitey IA and JobIA occurs through versioned APIs/contracts.

## Capability relationship

```text
Bitey IA / Bitey IA Web
        │
        │ employment specialization required
        ▼
      JobIA
        │
        ├── JobIA-Web
        └── JobIA-app

JobIA ── general capability required ──► Bitey IA
Bitey Trainer ── validates capabilities ─► JobIA
```

## Backend contract

Configure:

```bash
VITE_JOBIA_API_URL=https://your-jobia-backend.example
```

Primary endpoints:

- `GET /health`
- `GET /jobs`
- `GET /jobs/{job_id}`
- `GET /profile`
- `PUT /profile`
- `POST /applications/prepare`
- `GET /api/v1/capabilities`
- `GET /api/v1/module/status`
- `GET /api/v1/contract`

The `JobIA` backend is the authority for specialized employment intelligence. The frontend must not duplicate matching, ranking, or application-preparation algorithms in production.

## Responsibilities of the web channel

The frontend owns presentation and client-side experience state, including navigation, filters, saved items, local session UX, application review/editing, and responsive presentation.

The backend owns employment intelligence, including opportunity discovery, normalization, matching, ranking, explanations, and application preparation.

## Features

- Professional dashboard.
- Opportunity search and filters.
- Backend-provided compatibility ranking and explanations.
- Professional profile.
- Saved opportunities.
- Alerts.
- Application tracking.
- CV, cover-letter, and response preparation through JobIA.
- Responsive desktop/mobile interface.
- Demo fallback for development/offline use only.

## Security

Never include in the browser:

- private provider keys;
- database credentials;
- Supabase `service_role` keys;
- integration secrets.

Sensitive external actions require explicit user consent.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

The production build must pass TypeScript and Vite before deployment.

## Cloudflare deployment

The production Worker is named **`jobia-web`**.

Expected Cloudflare configuration:

```text
Root directory: /
Build command: npm run build
Deploy command: npx wrangler deploy
Node.js: 22
```

The deployment must publish the Vite `dist/` output through the `jobia-web` Worker. Do not create a second Worker name for this frontend.

## Principle

> **Bitey IA is the general system. JobIA is a specialized employment/work module. JobIA-Web is JobIA's web channel. JobIA-app is JobIA's Android channel. Bitey IA Web is the web channel of Bitey IA.**
