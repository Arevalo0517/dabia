# DABIA Website V5

Website comercial de DABIA — AI & Business Automation.

V5 enfoca la homepage en conversión: un mensaje claro, una sola CTA dominante y menos secciones. El contenido detallado se movió a páginas secundarias dedicadas.

## Páginas

- `index.html` — homepage. Hero, 3 áreas, cómo funciona, 3 ejemplos, por qué DABIA, CTA final, FAQ corto.
- `solutions.html` — detalle de las soluciones (Ventas, Operaciones, Atención, Custom).
- `assessment.html` — Diagnóstico de Automatización (30–45 min).
- `how-it-works.html` — método completo (Diagnosticar → Medir → Priorizar → Construir → Demostrar → Optimizar).
- `contact.html` — formulario de contacto (`<form id="leadForm">` listo para conectar a `/api/contact`).
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

HTML + CSS + Vanilla JavaScript. Sin frameworks. Sin build step.

## Archivos de soporte

- `BRAND-KIT.md` — paleta, tipografía, tono de marca.
- `CLIENT-ACQUISITION-PLAN.md` — plan comercial interno (30 días).
- `PUBLISH-CHECKLIST.md` — checklist pre-producción.
- `prospecting-tracker.csv` — tracker simple de respaldo.

## Publicación

Puede publicarse como sitio estático en Vercel, Netlify, Cloudflare Pages o cualquier hosting estático.

## Pendiente antes de producción

1. Dominio y email comercial.
2. Crear `assets/og.png` (1200×630) y wire `og:image` + `twitter:card` en cada `<head>`.
3. Crear `assets/apple-touch-icon.png` (180×180) y referenciarlo.
4. Definir y colocar `<link rel="canonical">` en cada página.
5. Conectar `contact.html` (`#leadForm`) a `/api/contact` (n8n o backend equivalente).
6. Completar `privacy.html` con datos fiscales y domicilio de DABIA.
7. Política de cookies cuando se agregue analítica.
8. Probar mobile, desktop, Chrome y Safari en 320 / 375 / 768 / 1024 / desktop amplio.
