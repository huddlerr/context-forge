export interface Question {
  id: number;
  label: string;
  icon: string;
  color: string;
  title: string;
  sub: string;
  ph: string;
  out: string[];
  why: string;
  w: number;
  smart?: boolean;
}

export const QS: Question[] = [
  { id: 1, label: "Soul", icon: "\u2726", color: "#ff672a", title: "What's the ONE thing?", sub: "The single core feature in one sentence.", ph: '"Users create and organize travel group logistics with venue voting"', out: ["soul.md"], why: "Defines atomic value. soul.md becomes the north star.", w: 1.0 },
  { id: 2, label: "User", icon: "\u25C9", color: "#e85d26", title: "Who picks this up?", sub: "Primary user. Age, context, what they escape FROM.", ph: '"Youth soccer families (parents 30-50). Phone at tournaments."', out: ["soul.md", "design.md"], why: "Drives every design decision.", w: 0.9 },
  { id: 3, label: "Stack", icon: "\u2699", color: "#d95422", title: "What's the stack?", sub: "Framework, backend, database.", ph: '"Expo SDK 55, Convex, NativeWind, Zustand, TypeScript"', out: ["package.json", "tsconfig.json", "claude.md"], why: "Auto-detects real npm packages.", w: 1.0, smart: true },
  { id: 4, label: "Data", icon: "\u25C8", color: "#cc4b1e", title: "What's the data model?", sub: "Core entities and fields.", ph: '"Trips (name, destination, date_range, owner_id). Members (user_id, trip_id, role)."', out: ["types.ts", "claude.md"], why: "Generates TypeScript interfaces.", w: 1.0, smart: true },
  { id: 5, label: "Flow", icon: "\u2192", color: "#bf421a", title: "What's the user flow?", sub: "Screen \u2192 action \u2192 Screen. Max 6 steps.", ph: '"1. Open \u2192 trips list  2. Tap + \u2192 create  3. Share link \u2192 join"', out: ["claude.md", "README.md"], why: "This IS the build order.", w: 0.9, smart: true },
  { id: 6, label: "Vibe", icon: "\u25D0", color: "#b23916", title: "What's the vibe?", sub: "Colors, mood, light/dark?", ph: '"Energetic but clean. Blue (#2563eb) + white. Inter. Rounded."', out: ["design.md"], why: "Complete design token system.", w: 0.7 },
  { id: 7, label: "Auth", icon: "\u25D1", color: "#a53012", title: "Auth & permissions?", sub: "How users get in. Roles.", ph: '"Email/password + Google via Clerk. owner + member roles."', out: [".env.example", "claude.md"], why: "Auth touches every layer.", w: 0.9, smart: true },
  { id: 8, label: "APIs", icon: "\u2295", color: "#98270e", title: "What plugs in?", sub: "Third-party services, AI, payments.", ph: '"Foursquare Places. Gemini 2.5 Flash. Stripe."', out: [".env.example", "claude.md"], why: "Each needs env vars + wrapper.", w: 0.7, smart: true },
  { id: 9, label: "Rules", icon: "\u2298", color: "#8b1e0a", title: "Hard rules?", sub: "Constraints, forbidden patterns.", ph: '"NativeWind only. Offline. 60fps. All text \u226514px."', out: [".cursorrules"], why: "Guardrails prevent rewrites.", w: 0.6 },
  { id: 10, label: "Done", icon: "\u25C6", color: "#7e1506", title: "What does DONE look like?", sub: "v1 acceptance criteria.", ph: '"Create/join trips. Invite link. Vote venues. TestFlight."', out: ["README.md", "TASKS.md"], why: "So agents know when to STOP.", w: 0.8 },
];
