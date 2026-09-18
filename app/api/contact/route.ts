import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Limites de saisie (OWASP: validate input server-side) ──
const NAME_MAX = 80;
const SUBJECT_MAX = 120;
const MESSAGE_MAX = 2500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zakariach05.vercel.app").replace(/\/$/, "");
const EMAIL_LOGO_URL =
  process.env.EMAIL_LOGO_URL || `${SITE_URL}/NV-IMG/logo.png`;

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
    const headerSafeName = cleanName.replace(/[\r\n]+/g, " ");
    const receivedAt = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Africa/Casablanca",
    }).format(new Date());

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
      subject: `Nouveau message depuis votre portfolio — ${headerSafeName}`,
      replyTo: cleanEmail,
      text: [
        "Nouveau message depuis votre portfolio",
        "",
        `Nom : ${cleanName}`,
        `Email : ${cleanEmail}`,
        cleanSubject ? `Sujet : ${cleanSubject}` : "",
        `Date : ${receivedAt}`,
        "",
        "Message",
        cleanMessage,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <!doctype html>
        <html lang="fr">
          <body style="margin:0;padding:0;background:#f3f4f6;color:#111827;font-family:Arial,Helvetica,sans-serif;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:#f3f4f6;">
              <tr>
                <td align="center" style="padding:32px 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                    <tr>
                      <td align="center" style="padding:28px 24px 24px;background:#111827;">
                        <img src="${escapeHtml(EMAIL_LOGO_URL)}" alt="Portfolio de Zakaria Chamekh" width="90" height="93" style="display:block;width:90px;height:93px;object-fit:contain;border:0;outline:none;text-decoration:none;" />
                        <p style="margin:14px 0 0;color:#ffffff;font-size:13px;line-height:20px;letter-spacing:1.5px;text-transform:uppercase;">Portfolio — Contact</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 32px 8px;">
                        <p style="margin:0 0 8px;color:#dc2626;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Notification</p>
                        <h1 style="margin:0;color:#111827;font-size:26px;line-height:34px;font-weight:700;">Nouveau message depuis votre portfolio</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 32px 8px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;font-size:15px;line-height:22px;">
                          <tr><td style="padding:9px 0;color:#6b7280;width:90px;">Nom</td><td style="padding:9px 0;color:#111827;font-weight:bold;">${escapeHtml(cleanName)}</td></tr>
                          <tr><td style="padding:9px 0;color:#6b7280;border-top:1px solid #f0f0f0;">Email</td><td style="padding:9px 0;border-top:1px solid #f0f0f0;"><a href="mailto:${encodeURIComponent(cleanEmail)}" style="color:#dc2626;text-decoration:none;">${escapeHtml(cleanEmail)}</a></td></tr>
                          ${cleanSubject ? `<tr><td style="padding:9px 0;color:#6b7280;border-top:1px solid #f0f0f0;">Sujet</td><td style="padding:9px 0;color:#111827;border-top:1px solid #f0f0f0;">${escapeHtml(cleanSubject)}</td></tr>` : ""}
                          <tr><td style="padding:9px 0;color:#6b7280;border-top:1px solid #f0f0f0;">Date</td><td style="padding:9px 0;color:#111827;border-top:1px solid #f0f0f0;">${escapeHtml(receivedAt)}</td></tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 32px 8px;">
                        <p style="margin:0 0 10px;color:#111827;font-size:16px;font-weight:bold;">Message</p>
                        <div style="padding:18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;color:#374151;font-size:15px;line-height:24px;word-break:break-word;">${escapeHtml(cleanMessage).replace(/\n/g, "<br />")}</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding:28px 32px 32px;">
                        <a href="mailto:${encodeURIComponent(cleanEmail)}" style="display:inline-block;padding:13px 22px;background:#dc2626;color:#ffffff;font-size:14px;font-weight:bold;line-height:20px;text-decoration:none;border-radius:6px;">Répondre au client</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                        <p style="margin:0;color:#6b7280;font-size:12px;line-height:18px;">Ce message a été envoyé depuis le formulaire de contact de votre portfolio.</p>
                        <p style="margin:6px 0 0;color:#9ca3af;font-size:12px;line-height:18px;">${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
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
