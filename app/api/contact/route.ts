import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Limites de saisie (OWASP: validate input server-side) ──
const NAME_MAX = 80;
const SUBJECT_MAX = 120;
const MESSAGE_MAX = 2500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Échappe HTML/JS pour contrer l'injection dans l'email de notification
 * (un visiteur pourrait envoyer "<img src=x onerror=...>" etc.).
 * On n'insère jamais le contenu utilisateur brut dans le HTML.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Rate limiting simple en mémoire (anti-spam / brute-force) ──
// Limitation : en mémoire par instance serverless — acceptable en dev ;
// pour une protection robuste multi-régions, utiliser Upstash Redis,
// RateLimitHeaders etc. (voir README sécurité).
const WINDOW_MS = 10 * 60 * 1000; // 10 min
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

// Nettoyage périodique de la map (évite une fuite mémoire en dev).
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) {
    if (entry.resetAt < now) hits.delete(ip);
  }
}, 60 * 1000).unref?.();

export async function POST(request: Request) {
  // ── CORS / origine : refuser les requêtes cross-origin non approuvées ──
  const origin = request.headers.get("origin");
  const ALLOWED_ORIGINS = new Set([
    "https://zakariach05.vercel.app",
    "http://localhost:3000",
  ]);
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  // ── Rate limiting par IP ──
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, subject, message } = body ?? {};

    // ── Validation serveur (le client peut être contourné) ──
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = (typeof subject === "string" ? subject : "").trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
    if (cleanName.length > NAME_MAX || cleanMessage.length > MESSAGE_MAX) {
      return NextResponse.json(
        { error: "Field exceeds maximum length." },
        { status: 400 }
      );
    }
    if (cleanSubject.length > SUBJECT_MAX) {
      return NextResponse.json(
        { error: "Field exceeds maximum length." },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // ── Envoi : contenu échappé → pas d'injection HTML dans l'email ──
    const { data, error } = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: "chamekhzakaria95@gmail.com",
      subject: `New portfolio message from ${escapeHtml(cleanName)}`,
      replyTo: cleanEmail,
      text: [
        `From: ${cleanName} (${cleanEmail})`,
        cleanSubject ? `Subject: ${cleanSubject}` : "",
        "",
        cleanMessage,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <p><strong>From:</strong> ${escapeHtml(cleanName)} (${escapeHtml(
          cleanEmail
        )})</p>
        ${cleanSubject ? `<p><strong>Subject:</strong> ${escapeHtml(cleanSubject)}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(cleanMessage).replace(/\n/g, "<br/>")}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}