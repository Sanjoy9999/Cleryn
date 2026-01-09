// Netlify Function: POST /.netlify/functions/contact
// Keeps EmailJS IDs/keys off the browser. Configure via environment variables.

const EMAILJS_SEND_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(
      405,
      { ok: false, error: "Method not allowed" },
      { Allow: "POST" }
    );
  }

  // Optional: restrict who can call this endpoint
  // Set ALLOWED_ORIGIN to your production origin, e.g. https://www.example.com
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const origin = event.headers.origin || event.headers.Origin || "";
  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return json(403, { ok: false, error: "Forbidden" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON" });
  }

  // Honeypot
  if (payload.website && String(payload.website).trim()) {
    return json(200, { ok: true });
  }

  const from_name = String(payload.from_name || "").trim();
  const from_email = String(payload.from_email || "").trim();
  const phone = String(payload.phone || "").trim();
  const message = String(payload.message || "").trim();

  if (!from_name || !from_email || !message) {
    return json(400, { ok: false, error: "Missing required fields" });
  }

  const service_id = process.env.EMAILJS_SERVICE_ID;
  const template_id = process.env.EMAILJS_TEMPLATE_ID;
  const user_id = process.env.EMAILJS_PUBLIC_KEY;

  if (!service_id || !template_id || !user_id) {
    return json(500, { ok: false, error: "Email service is not configured" });
  }

  const emailjsBody = {
    service_id,
    template_id,
    user_id,
    template_params: {
      from_name,
      from_email,
      phone,
      message,
    },
  };

  try {
    const res = await fetch(EMAILJS_SEND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailjsBody),
    });

    if (!res.ok) {
      return json(502, { ok: false, error: "Email provider error" });
    }

    return json(200, { ok: true });
  } catch {
    return json(502, { ok: false, error: "Email provider unreachable" });
  }
};
