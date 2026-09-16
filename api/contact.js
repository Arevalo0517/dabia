/* DABIA — /api/contact
 *
 * Funcion serverless de Vercel (Node.js, CommonJS).
 * Recibe POST desde el formulario de contacto del sitio.
 * Valida, sanitiza y reenvia el prospecto a n8n mediante
 * la variable de entorno N8N_LEAD_WEBHOOK_URL.
 *
 * Reglas:
 *  - Solo POST. Otros metodos -> 405.
 *  - Cache-Control: no-store en todas las respuestas.
 *  - No confiar en la validacion del cliente.
 *  - No exponer el webhook, ni logs con datos personales.
 *  - Respuestas siempre en JSON con mensajes genericos en espanol.
 *
 * Sin dependencias externas. Sin frameworks.
 */

'use strict';

// ---------- Limites (alineados con la spec del proyecto) ----------
const LIMITS = {
  nombre:   { required: true,  max: 100 },
  empresa:  { required: true,  max: 150 },
  correo:   { required: true,  max: 254, isEmail: true },
  telefono: { required: false, max: 40 },
  proceso:  { required: true,  max: 2000 },
};

const TIMEOUT_MS = 8000;

const RESP_MESSAGES = {
  ok: 'Gracias. Recibimos tu información correctamente.',
  invalid: 'Revisa la información e inténtalo nuevamente.',
  temporary: 'No pudimos enviar tu solicitud en este momento. Inténtalo nuevamente.',
  method: 'Método no permitido.',
};

// ---------- Helpers de validacion (exportados para testing local) ----------

function asString(v) {
  if (typeof v !== 'string') return '';
  return v;
}

function isEmailFormat(value) {
  if (typeof value !== 'string') return false;
  if (value.length > 254) return false;
  // Validacion razonable, no RFC 5322 completo. Suficiente para evitar
  //显而易见的 typos; el envio real pasara por CRM que normalizara.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateLead(rawBody) {
  // Solo se aceptan objetos planos (no arrays, no null).
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return { ok: false };
  }

  const out = {};
  const issues = {};

  for (const field of Object.keys(LIMITS)) {
    const rules = LIMITS[field];
    const original = asString(rawBody[field]);
    const trimmed = original.trim();

    if (!trimmed) {
      if (rules.required) {
        issues[field] = 'requerido';
        continue;
      }
      // Campo opcional vacio: lo dejamos fuera del payload final.
      continue;
    }

    if (trimmed.length > rules.max) {
      issues[field] = 'longitud';
      continue;
    }

    if (rules.isEmail && !isEmailFormat(trimmed)) {
      issues[field] = 'formato';
      continue;
    }

    out[field] = trimmed;
  }

  if (Object.keys(issues).length > 0) {
    return { ok: false, issues };
  }

  return { ok: true, lead: out };
}

function buildPayload(lead) {
  return {
    nombre: lead.nombre,
    empresa: lead.empresa,
    correo: lead.correo,
    telefono: lead.telefono || '',
    proceso: lead.proceso,
    origen: 'sitio_web',
    fecha_recepcion: new Date().toISOString(),
  };
}

async function forwardToN8N(webhookUrl, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      return { ok: false, reason: 'upstream_status', status: response.status };
    }
    return { ok: true };
  } catch (err) {
    clearTimeout(timer);
    if (err && err.name === 'AbortError') {
      return { ok: false, reason: 'timeout' };
    }
    return { ok: false, reason: 'network' };
  }
}

// ---------- Handler de Vercel ----------

module.exports = async function handler(req, res) {
  // Sin cache en ningun caso.
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, mensaje: RESP_MESSAGES.method });
    return;
  }

  // Vercel parsea automaticamente el body cuando Content-Type es
  // application/json. Defensivo: aceptar tambien un string crudo.
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_e) {
      res.status(400).json({ ok: false, mensaje: RESP_MESSAGES.invalid });
      return;
    }
  }

  const result = validateLead(body);
  if (!result.ok) {
    // Log tecnico sin PII. Solo告诉我们 que la peticion fallo la
    // validacion; no que campo ni que valor.
    console.warn('[contact] validation_failed');
    res.status(400).json({ ok: false, mensaje: RESP_MESSAGES.invalid });
    return;
  }

  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!webhookUrl || typeof webhookUrl !== 'string') {
    console.error('[contact] webhook_not_configured');
    res.status(500).json({ ok: false, mensaje: RESP_MESSAGES.temporary });
    return;
  }

  const payload = buildPayload(result.lead);
  const forward = await forwardToN8N(webhookUrl, payload);

  if (!forward.ok) {
    console.error('[contact] forward_failed', JSON.stringify({ reason: forward.reason }));
    res.status(500).json({ ok: false, mensaje: RESP_MESSAGES.temporary });
    return;
  }

  res.status(200).json({ ok: true, mensaje: RESP_MESSAGES.ok });
};

// ---------- Exports para testing (no expuestos en el bundle de Vercel) ----------
module.exports.validateLead = validateLead;
module.exports.buildPayload = buildPayload;
module.exports.forwardToN8N = forwardToN8N;
module.exports.LIMITS = LIMITS;
