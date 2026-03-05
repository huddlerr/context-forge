// Second Brain onboarding questions
// Each section maps to a context file or rule file

export const SB_SECTIONS = [
  {
    id: 1,
    label: "You",
    icon: "◆",
    color: "#ff672a",
    title: "About You",
    sub: "Let's build your profile so your assistant knows who it's working for.",
    questions: [
      { id: "name",     label: "Your name",                          ph: "Alex Johnson",                                    out: ["context/me.md"] },
      { id: "role",     label: "Role / title",                       ph: "CEO, freelancer, content creator, developer…",    out: ["context/me.md"] },
      { id: "timezone", label: "Timezone",                           ph: "US/Eastern (EST)",                                out: ["context/me.md"] },
      { id: "oneliner", label: "In one sentence, what do you do?",   ph: "I build and sell SaaS tools for indie hackers.",   out: ["context/me.md"] },
      { id: "priority", label: "Your #1 priority — the thing everything else should support", ph: "Grow MRR to $20k by Q3.", out: ["CLAUDE.md", "context/me.md"] },
    ],
  },
  {
    id: 2,
    label: "Work",
    icon: "⬡",
    color: "#e85d26",
    title: "Your Business / Work",
    sub: "Help your assistant understand what you're building and how you operate.",
    questions: [
      { id: "company",  label: "Company or business name",                                ph: "Acme Labs",                                  out: ["context/work.md"] },
      { id: "products", label: "Products, services, or revenue streams (one per line)",   ph: "SaaS tool — $8k MRR\nConsulting — $3k/mo",   out: ["context/work.md"] },
      { id: "tools",    label: "Day-to-day tools",                                        ph: "ClickUp, Notion, Slack, Google Workspace",    out: ["context/work.md", "CLAUDE.md"] },
      { id: "mcps",     label: "MCP servers connected to Claude Code (or 'none')",        ph: "none",                                        out: ["CLAUDE.md"] },
    ],
  },
  {
    id: 3,
    label: "Team",
    icon: "◉",
    color: "#d95422",
    title: "Your Team",
    sub: "Who should your assistant know about?",
    questions: [
      { id: "teamsize",  label: "Team size (or 'solo')",                                                   ph: "3 people",                                          out: ["context/team.md"] },
      { id: "keypeople", label: "Key people (name, role, when to loop them in) — one per line",            ph: "Jordan — Head of Product — loop in on roadmap calls", out: ["context/team.md"] },
      { id: "comms",     label: "Where does your team communicate?",                                       ph: "Slack + ClickUp",                                    out: ["context/team.md"] },
      { id: "teampain",  label: "Biggest pain point with managing your team",                              ph: "Context switching between tools",                    out: ["context/team.md"] },
    ],
  },
  {
    id: 4,
    label: "Goals",
    icon: "→",
    color: "#cc4b1e",
    title: "Priorities, Goals & Projects",
    sub: "What are you focused on right now?",
    questions: [
      { id: "focuses",   label: "3–5 things you're most focused on right now (one per line)", ph: "Launch v2\nHire a VA\nClose 3 enterprise deals",  out: ["context/current-priorities.md"] },
      { id: "deadlines", label: "Deadlines or time-sensitive items",                          ph: "Product launch: April 15",                          out: ["context/current-priorities.md"] },
      { id: "goals",     label: "Quarterly goals or milestones (or 'use priorities above')", ph: "Q2: $20k MRR, 500 users, 1 enterprise contract",    out: ["context/goals.md"] },
      { id: "projects",  label: "Active projects/workstreams (one per line, with status)",   ph: "Launching new course — active\nHiring VA — planning", out: ["projects/"] },
    ],
  },
  {
    id: 5,
    label: "Style",
    icon: "◐",
    color: "#bf421a",
    title: "Communication Preferences",
    sub: "How should your assistant write and talk to you?",
    questions: [
      { id: "format",    label: "How do you like information presented?",            ph: "Bullet points for tasks, paragraphs for analysis",  out: [".claude/rules/communication-style.md"] },
      { id: "peeves",    label: "Writing pet peeves (or 'none')",                    ph: "Never use emojis. No em dashes. Keep it concise.",  out: [".claude/rules/communication-style.md"] },
      { id: "internal",  label: "Internal tone (how I talk to you)",                 ph: "Casual and direct",                                 out: [".claude/rules/communication-style.md"] },
      { id: "external",  label: "External / public-facing tone",                     ph: "Professional but approachable",                     out: [".claude/rules/communication-style.md"] },
    ],
  },
  {
    id: 6,
    label: "Help",
    icon: "◈",
    color: "#b23916",
    title: "What Do You Want Help With?",
    sub: "This becomes your Skills Backlog — the workflows we'll build over time.",
    questions: [
      { id: "recurring",  label: "Recurring tasks that eat up your time (list as many as you want)", ph: "Writing weekly updates\nDrafting proposals\nResearching competitors", out: ["CLAUDE.md"] },
      { id: "handoff",    label: "What would you hand off to an assistant first?",                   ph: "Drafting email replies",                                              out: ["CLAUDE.md"] },
      { id: "automate",   label: "Workflows you want to automate or templatize (or 'none')",         ph: "Client onboarding emails\nWeekly team standup summaries",             out: ["CLAUDE.md"] },
    ],
  },
];

// Flat map of all question ids for easy lookup
export const SB_ALL_QUESTIONS = SB_SECTIONS.flatMap(s => s.questions);

// Total question count
export const SB_TOTAL_QUESTIONS = SB_ALL_QUESTIONS.length;
