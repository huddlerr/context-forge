export interface AuthProvider {
  p: string;
  k: string[];
}

export function detectAuth(t: string): AuthProvider[] {
  const l = (t || "").toLowerCase(),
    r: AuthProvider[] = [];
  if (l.includes("clerk"))
    r.push({ p: "Clerk", k: ["CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"] });
  if (l.includes("supabase"))
    r.push({
      p: "Supabase Auth",
      k: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    });
  if (l.includes("firebase"))
    r.push({ p: "Firebase Auth", k: ["FIREBASE_API_KEY"] });
  if (l.includes("google") || l.includes("oauth"))
    r.push({ p: "Google OAuth", k: ["GOOGLE_CLIENT_ID"] });
  if (l.includes("email") || l.includes("password"))
    r.push({ p: "Email/Password", k: [] });
  return r;
}
