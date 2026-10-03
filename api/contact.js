import nodemailer from "nodemailer";

// POST /api/contact
// Validates a contact-form submission and emails it to the site owner.
// Runs as a Vercel Function in production, and through the dev-server middleware
// in vite.config.js locally. Configure it with environment variables (see .env.example):
//
//   SMTP_USER, SMTP_PASS   required. For Gmail: your address and an App Password.
//   SMTP_HOST, SMTP_PORT   optional, default smtp.gmail.com:465
//   CONTACT_TO             optional, where messages go. Default SMTP_USER.
//   CONTACT_FROM           optional, the sender address. Default SMTP_USER.

const LIMITS = { name: 100, email: 200, message: 5000 };
const MIN_MESSAGE = 10;
// Dot-separated domain labels; written so it runs in linear time on hostile input.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
// Submissions faster than this after the form appeared are almost certainly bots.
const MIN_FILL_MS = 2500;
// Best-effort rate limit. It is per server instance, so it slows abuse rather than stopping it.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map();

let transporter;

function getTransporter() {
  const { SMTP_USER, SMTP_PASS, SMTP_HOST = "smtp.gmail.com", SMTP_PORT = "465" } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return null;
  transporter ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // Fail fast instead of holding the visitor's request open if the mail server stalls.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  return (typeof forwarded === "string" && forwarded.split(",")[0].trim()) || req.socket?.remoteAddress || "unknown";
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function validate(body) {
  const name = String(body.name ?? "").replace(/\s+/g, " ").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name) return { error: "Please tell me your name." };
  if (name.length > LIMITS.name) return { error: `Please keep your name under ${LIMITS.name} characters.` };
  if (email.length > LIMITS.email || !EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (message.length < MIN_MESSAGE) return { error: `Please write at least ${MIN_MESSAGE} characters.` };
  if (message.length > LIMITS.message) return { error: `Please keep your message under ${LIMITS.message} characters.` };

  return { data: { name, email, message } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  let body = req.body ?? {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid request." });
    }
  }

  // Bots fill the hidden field or submit instantly. Pretend it worked so they don't adapt.
  const elapsed = Number(body.elapsed);
  if (body.company || (Number.isFinite(elapsed) && elapsed < MIN_FILL_MS)) {
    return res.status(200).json({ ok: true });
  }

  const { data, error } = validate(body);
  if (error) return res.status(400).json({ error });

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ error: "Too many messages. Please try again in a few minutes." });
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.error("contact: SMTP_USER / SMTP_PASS are not set");
    return res.status(503).json({ error: "The contact form isn't configured yet." });
  }

  const to = process.env.CONTACT_TO || process.env.SMTP_USER;
  const from = process.env.CONTACT_FROM || process.env.SMTP_USER;

  try {
    const info = await mailer.sendMail({
      from: { name: "Portfolio contact form", address: from },
      to,
      replyTo: { name: data.name, address: data.email },
      subject: `New message from ${data.name}`,
      text: `${data.message}\n\n—\n${data.name} <${data.email}>\nSent from your portfolio contact form. Reply to this email to answer them.`,
      html: `
        <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
          <p style="white-space:pre-wrap;margin:0 0 20px">${escapeHtml(data.message)}</p>
          <hr style="border:0;border-top:1px solid #ddd">
          <p style="margin:12px 0 0;color:#555">
            <strong>${escapeHtml(data.name)}</strong> &lt;${escapeHtml(data.email)}&gt;<br>
            Sent from your portfolio contact form. Reply to this email to answer them.
          </p>
        </div>`,
    });
    // getTestMessageUrl only returns a link for Ethereal test accounts.
    const preview = nodemailer.getTestMessageUrl(info);
    console.log("contact: sent", info.messageId, preview || "");
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact: send failed", err);
    return res.status(502).json({ error: "Couldn't send your message right now." });
  }
}
