// ── STACK DETECTION PATTERNS ──────────────────────────────────
// Maps technology keywords to their npm packages and category.

export const STACK_PATTERNS = {
  "expo": { deps: { "expo": "~52.0.0", "expo-router": "~4.0.0" }, devDeps: { "@babel/core": "^7.24.0" }, type: "mobile" },
  "react native": { deps: { "react-native": "0.76.0" }, devDeps: {}, type: "mobile" },
  "next": { deps: { "next": "15.0.0", "react": "^19.0.0", "react-dom": "^19.0.0" }, devDeps: { "typescript": "^5" }, type: "web" },
  "remix": { deps: { "@remix-run/react": "^2.0.0" }, devDeps: { "typescript": "^5" }, type: "web" },
  "vite": { deps: { "react": "^18.3.0", "react-dom": "^18.3.0" }, devDeps: { "vite": "^6.0.0" }, type: "web" },
  "convex": { deps: { "convex": "^1.17.0" }, devDeps: {}, type: "backend" },
  "supabase": { deps: { "@supabase/supabase-js": "^2.45.0" }, devDeps: {}, type: "backend" },
  "firebase": { deps: { "firebase": "^11.0.0" }, devDeps: {}, type: "backend" },
  "clerk": { deps: { "@clerk/clerk-expo": "^2.5.0" }, devDeps: {}, type: "auth" },
  "nativewind": { deps: { "nativewind": "^4.0.0" }, devDeps: { "tailwindcss": "^3.4.0" }, type: "styling" },
  "tailwind": { deps: { "tailwindcss": "^3.4.0" }, devDeps: { "postcss": "^8.4.0" }, type: "styling" },
  "zustand": { deps: { "zustand": "^5.0.0" }, devDeps: {}, type: "state" },
  "stripe": { deps: { "stripe": "^17.0.0" }, devDeps: {}, type: "payments" },
  "typescript": { deps: {}, devDeps: { "typescript": "^5.6.0" }, type: "lang" },
  "gemini": { deps: { "@google/generative-ai": "^0.21.0" }, devDeps: {}, type: "ai" },
  "openai": { deps: { "openai": "^4.70.0" }, devDeps: {}, type: "ai" },
  "sentry": { deps: { "@sentry/react-native": "^6.0.0" }, devDeps: {}, type: "monitoring" },
  "foursquare": { deps: {}, devDeps: {}, type: "api" },
  "drizzle": { deps: { "drizzle-orm": "^0.35.0" }, devDeps: { "drizzle-kit": "^0.25.0" }, type: "orm" },
  "prisma": { deps: { "@prisma/client": "^6.0.0" }, devDeps: { "prisma": "^6.0.0" }, type: "orm" },
};
