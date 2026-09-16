# DABIA Website V5

Website comercial de DABIA — AI & Business Automation.

Sitio estático (HTML + CSS + Vanilla JavaScript) preparado para publicación en Vercel.

## Páginas

- `index.html` — homepage. Hero, qué automatizamos, cómo transformamos un proceso, tiempo/dinero/capacidad, personas + automatización, diagnóstico, preguntas frecuentes.
- `solutions.html` — detalle de las soluciones (Ventas, Operaciones, Atención, Custom).
- `assessment.html` — Diagnóstico de Automatización (30–45 min).
- `how-it-works.html` — método completo (Diagnosticar → Medir → Priorizar → Construir → Demostrar → Optimizar).
- `contact.html` — formulario de contacto (`<form id="leadForm">` preparado para futura integración con `/api/contact`).
- `privacy.html` — política de privacidad (versión inicial, con TODO marcado).

## Estructura

```text
.
├── index.html
├── solutions.html
├── assessment.html
├── how-it-works.html
├── contact.html
├── privacy.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── assets/
    ├── dabia-logo.png
    └── dabia-favicon.png
```

## Stack

- HTML semántico
- CSS plano en archivo único (`css/styles.css`)
- JavaScript vanilla (`js/main.js`, deferred, defensivo)
- Sin frameworks, sin React, sin Next.js, sin build step

## Archivos de soporte

- `BRAND-KIT.md` — paleta, tipografía, tono de marca.
- `CLIENT-ACQUISITION-PLAN.md` — plan comercial interno (30 días).
- `PUBLISH-CHECKLIST.md` — checklist pre-producción.
- `prospecting-tracker.csv` — tracker simple de respaldo.

## Publicación

Vercel detecta automáticamente el proyecto como sitio estático. No se necesita `vercel.json` ni configuración adicional para Fase 1.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Arevalo0517/dabia.git
cd dabia
```

### 2. Probar localmente

Cualquier servidor estático sirve. Ejemplos:

```bash
python3 -m http.server 8080
# luego abrir http://localhost:8080
```

O con Node:

```bash
npx http-server -p 8080
```

### 3. Importar en Vercel

- Ir a https://vercel.com/new
- Seleccionar el repositorio `Arevalo0517/dabia`
- Framework Preset: **"Other"**
- Root Directory: `./` (raíz)
- Build Command: vacío (no hay build step)
- Output Directory: vacío (Vercel sirve los archivos tal cual)
- Install Command: vacío

### 4. Desplegar

Click en **Deploy**. La primera compilación toma ~30 s. Cada push a `main` redespliega automáticamente.

### 5. Conectar un dominio (después del lanzamiento)

- Vercel → Project → Settings → Domains
- Agregar el dominio (ej. `dabia.com`)
- Configurar DNS en el registrador con los registros que Vercel indica
- Esperar propagación (puede tardar hasta 24 h)
- Vercel emite el certificado HTTPS automáticamente

## SEO básico (estado actual)

Cada página tiene: `lang="es-MX"`, `<title>` único, `<meta description>`, `<meta theme-color>`, favicon, un solo `<h1>`, headings semánticos.

`<meta name="robots" content="noindex, nofollow">` está activo por defecto para evitar indexación antes del lanzamiento. **Antes de publicar en producción, eliminar esta línea de cada `<head>`.**

Pendientes SEO pre-lanzamiento:
- Crear `assets/og.png` (1200×630) y agregar `og:image` + `twitter:card`.
- Crear `assets/apple-touch-icon.png` (180×180) y referenciarlo.
- Definir y colocar `<link rel="canonical">` por página.
- Configurar `sitemap.xml` y `robots.txt`.

## Accesibilidad

- Formularios con `<label>` enlazados por `id`/`for`.
- `autocomplete` correcto en cada campo.
- Focus visible en inputs y links.
- Imágenes del logo con `alt` descriptivo.
- `aria-describedby` enlaza el formulario con su nota.

Pendientes a futuro:
- `prefers-reduced-motion` para usuarios con motion reducido.
- Validación visual más explícita en inputs.

## Formulario de contacto

Flujo:

```
Formulario (contact.html)
  → fetch POST /api/contact  (js/main.js)
  → Vercel Serverless Function  (api/contact.js)
  → n8n  (variable N8N_LEAD_WEBHOOK_URL)
  → n8n crea prospecto en Notion + envia notificacion
```

El formulario vive en `contact.html` con `id="leadForm"` y los campos:

- `nombre` (requerido, max 100)
- `empresa` (requerido, max 150)
- `correo` (requerido, formato email, max 254)
- `telefono` (opcional, max 40)
- `proceso` (requerido, max 2000)

El navegador solo valida de forma defensiva; el servidor vuelve a validar todo. Si una validación falla, el cliente muestra `aria-invalid` en los campos afectados y un mensaje global.

### Variables de entorno

| Variable | Descripción | Dónde configurarla |
|---|---|---|
| `N8N_LEAD_WEBHOOK_URL` | URL del webhook de n8n que recibe los prospectos | Vercel → Project → Settings → Environment Variables |

Configuración en Vercel:

1. Project → **Settings** → **Environment Variables**
2. **Key:** `N8N_LEAD_WEBHOOK_URL`
3. **Value:** la URL real del webhook de n8n (proporcionada por n8n)
4. Marcar los entornos donde aplique (Production / Preview / Development)
5. Save → redesplegar si Vercel lo requiere

Sin esta variable, `/api/contact` responde 500 con mensaje genérico y registra `[contact] webhook_not_configured` en logs. **Nunca** incluir el valor real en el repositorio, código visible al navegador, ni README.

### Endpoint `/api/contact`

Vercel detecta automáticamente archivos en `api/` como serverless functions.

- Solo acepta `POST` (otros métodos → `405 Method Not Allowed`).
- Siempre responde JSON con `Cache-Control: no-store`.
- Whitelist: solo procesa `nombre`, `empresa`, `correo`, `telefono`, `proceso`. Otros campos del body se ignoran.
- El payload que recibe n8n incluye además `origen: "sitio_web"` y `fecha_recepcion` (ISO) — estos los agrega el servidor, nunca el cliente.
- Timeout a n8n: 8 segundos. Si no responde, devuelve error genérico.
- Sin dependencias externas. Sin frameworks.

Estructura JSON esperada por n8n:

```json
{
  "nombre": "...",
  "empresa": "...",
  "correo": "...",
  "telefono": "...",
  "proceso": "...",
  "origen": "sitio_web",
  "fecha_recepcion": "2026-09-16T20:00:00.000Z"
}
```

## Seguridad

- Sin claves, tokens ni secretos en el repositorio.
- `.gitignore` excluye `.env`, `.env.*`, `.DS_Store`, `node_modules/`, `.vercel/`, artefactos de build.
- `<meta name="robots" content="noindex, nofollow">` mientras esté en staging.
- `api/contact.js` no loguea datos personales (solo razones técnicas genéricas).
- El webhook de n8n nunca aparece en el bundle del navegador.

Pendientes pre-producción:
- Configurar headers HTTP de seguridad (`X-Content-Type-Options`, `Referrer-Policy`) vía `vercel.json` cuando se agregue backend.
- Política de cookies cuando se incorpore analítica.

## Próxima fase

El siguiente desarrollo será:

```
Formulario → /api/contact → n8n → Notion + notificación
```

(esto ya está implementado para `/api/contact` → `n8n`; falta cablear lo que n8n hace después).

Pendientes:

- Definir el workflow en n8n (recibir webhook → crear prospecto en Notion → enviar notificación).
- Eliminar `<meta name="robots" content="noindex, nofollow">` de cada página cuando esté listo para lanzamiento.
- (otras fases, no ahora): rate limiting, CAPTCHA/Turnstile, autenticación, Supabase, envío de correo directo, analítica avanzada, tracking publicitario.

## Pendientes antes de producción

1. Dominio y email comercial.
2. Crear `assets/og.png` (1200×630) y wire `og:image` + `twitter:card` en cada `<head>`.
3. Crear `assets/apple-touch-icon.png` (180×180) y referenciarlo.
4. Definir y colocar `<link rel="canonical">` en cada página.
5. Conectar `contact.html` (`#leadForm`) a `/api/contact` (n8n o backend equivalente).
6. Completar `privacy.html` con datos fiscales y domicilio de DABIA.
7. Política de cookies cuando se agregue analítica.
8. Probar mobile, desktop, Chrome y Safari en 320 / 375 / 768 / 1024 / desktop amplio.
