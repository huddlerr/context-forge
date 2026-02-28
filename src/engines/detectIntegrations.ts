export interface Integration {
  n: string;
  k: string[];
}

export function detectIntegrations(t: string): Integration[] {
  const l = (t || "").toLowerCase(),
    r: Integration[] = [];
  if (l.includes("gemini"))
    r.push({ n: "Google Gemini", k: ["GEMINI_API_KEY"] });
  if (l.includes("openai") || l.includes("gpt"))
    r.push({ n: "OpenAI", k: ["OPENAI_API_KEY"] });
  if (l.includes("stripe"))
    r.push({
      n: "Stripe",
      k: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY"],
    });
  if (l.includes("sentry")) r.push({ n: "Sentry", k: ["SENTRY_DSN"] });
  if (l.includes("foursquare"))
    r.push({ n: "Foursquare", k: ["FOURSQUARE_API_KEY"] });
  if (l.includes("resend"))
    r.push({ n: "Resend", k: ["RESEND_API_KEY"] });
  return r;
}
