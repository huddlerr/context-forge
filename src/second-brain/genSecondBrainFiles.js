// genSecondBrainFiles.js
// Generates the full Second Brain folder structure from onboarding answers.
// Returns a flat map of { "path/filename": "content" }

import { SB_SECTIONS } from "./sbQuestions.js";

function getAnswer(answers, id) {
  return (answers[id] || "").trim();
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function currentQuarter() {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}

function parseProjects(raw) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      // Try to detect status from line e.g. "Launch course — active"
      const statusMatch = line.match(/[-–—]\s*(active|planning|on hold|paused|complete)/i);
      const status = statusMatch ? statusMatch[1].toLowerCase() : "active";
      const name = line.replace(/[-–—]\s*(active|planning|on hold|paused|complete)/i, "").trim();
      return { name, status };
    });
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 40);
}

export function genSecondBrainFiles(answers) {
  const a = answers; // shorthand

  const name        = getAnswer(a, "name")       || "[Your Name]";
  const role        = getAnswer(a, "role")        || "[Role]";
  const timezone    = getAnswer(a, "timezone")    || "[Timezone]";
  const oneliner    = getAnswer(a, "oneliner")    || "[What you do]";
  const priority    = getAnswer(a, "priority")    || "[Top priority]";
  const company     = getAnswer(a, "company")     || "[Company]";
  const products    = getAnswer(a, "products")    || "[Products/services]";
  const tools       = getAnswer(a, "tools")       || "[Tools]";
  const mcps        = getAnswer(a, "mcps")        || "none";
  const teamsize    = getAnswer(a, "teamsize")    || "solo";
  const keypeople   = getAnswer(a, "keypeople")   || "";
  const comms       = getAnswer(a, "comms")       || "[Communication tools]";
  const teampain    = getAnswer(a, "teampain")    || "[Team pain point]";
  const focuses     = getAnswer(a, "focuses")     || "[Current focuses]";
  const deadlines   = getAnswer(a, "deadlines")   || "none";
  const goals       = getAnswer(a, "goals")       || focuses;
  const projects    = getAnswer(a, "projects")    || "";
  const format      = getAnswer(a, "format")      || "[Preferred format]";
  const peeves      = getAnswer(a, "peeves")      || "none";
  const internal    = getAnswer(a, "internal")    || "casual";
  const external    = getAnswer(a, "external")    || "professional";
  const recurring   = getAnswer(a, "recurring")   || "[Recurring tasks]";
  const handoff     = getAnswer(a, "handoff")     || "[First handoff]";
  const automate    = getAnswer(a, "automate")    || "none";

  const isSolo = teamsize.toLowerCase().includes("solo") || teamsize === "1";
  const parsedProjects = parseProjects(projects);

  // ── CLAUDE.md ──────────────────────────────────────────────────────────────
  const toolList = tools.split(/[,\n]/).map(t => t.trim()).filter(Boolean);
  const mcpList  = mcps.toLowerCase() === "none" ? [] : mcps.split(/[,\n]/).map(t => t.trim()).filter(Boolean);

  const skillsBacklog = [
    ...recurring.split("\n").map(t => t.trim()).filter(Boolean),
    handoff ? `First handoff: ${handoff}` : null,
    ...automate.split("\n").map(t => t.trim()).filter(Boolean).filter(t => t.toLowerCase() !== "none"),
  ].filter(Boolean);

  const claudeMd = `# CLAUDE.md

You are ${name}'s executive assistant and second brain.

## Top Priority
${priority}

## Context
@context/me.md
@context/work.md
${isSolo ? "" : "@context/team.md\n"}@context/current-priorities.md
@context/goals.md

## Tool Integrations
${toolList.map(t => `- ${t}`).join("\n") || "- None configured yet"}
${mcpList.length ? `\n## MCP Servers\n${mcpList.map(t => `- ${t}`).join("\n")}` : ""}

## Skills
Skills live in \`.claude/skills/\`. Each skill gets its own folder:
\`\`\`
.claude/skills/skill-name/SKILL.md
\`\`\`
Skills are built organically as recurring workflows emerge. See **Skills Backlog** below.

## Decision Log
All meaningful decisions are logged in \`decisions/log.md\` (append-only).
Format: \`[YYYY-MM-DD] DECISION: ... | REASONING: ... | CONTEXT: ...\`

## Memory
Claude Code maintains persistent memory across conversations. As you work, it automatically saves important patterns, preferences, and learnings.
- To save something permanently: "Remember that I always want X."
- Memory + context files + decision log = your assistant gets smarter over time.

## Keeping Context Current
- **Priorities shift?** Update \`context/current-priorities.md\`
- **New quarter?** Update \`context/goals.md\`
- **Made a decision?** Log it in \`decisions/log.md\`
- **Repeating a request?** Build a skill in \`.claude/skills/\`
- **Never delete** — archive to \`archives/\` instead

## Projects
Active workstreams live in \`projects/\`. Each has a \`README.md\` with status and key dates.

## Templates
Reusable templates live in \`templates/\`. Use \`templates/session-summary.md\` to close out sessions.

## References
SOPs in \`references/sops/\`. Style guides and examples in \`references/examples/\`.

## Archives
Completed or outdated material goes in \`archives/\`. Don't delete — archive.

## Skills Backlog
These are workflows to turn into skills over time:
${skillsBacklog.map(s => `- ${s}`).join("\n") || "- (Add recurring tasks here as they emerge)"}
`;

  // ── context/me.md ──────────────────────────────────────────────────────────
  const meMd = `# About Me

**Name:** ${name}
**Role:** ${role}
**Timezone:** ${timezone}
**What I do:** ${oneliner}
**#1 Priority:** ${priority}

*Last updated: ${today()}*
`;

  // ── context/work.md ────────────────────────────────────────────────────────
  const workMd = `# Work & Business

**Company:** ${company}

## Products / Services / Revenue Streams
${products.split("\n").map(l => l.trim()).filter(Boolean).map(l => `- ${l}`).join("\n") || "- [Add products/services here]"}

## Day-to-Day Tools
${toolList.map(t => `- ${t}`).join("\n") || "- [Add tools here]"}

*Last updated: ${today()}*
`;

  // ── context/team.md ────────────────────────────────────────────────────────
  const teamMd = isSolo
    ? `# Team\n\nCurrently operating solo.\n\n*Last updated: ${today()}*\n`
    : `# Team

**Size:** ${teamsize}
**Communication:** ${comms}

## Key People
${keypeople.split("\n").map(l => l.trim()).filter(Boolean).map(l => `- ${l}`).join("\n") || "- [Add key people here]"}

## Pain Points
${teampain}

*Last updated: ${today()}*
`;

  // ── context/current-priorities.md ─────────────────────────────────────────
  const focusList = focuses.split("\n").map(l => l.trim()).filter(Boolean);
  const deadlineList = deadlines.split("\n").map(l => l.trim()).filter(Boolean).filter(l => l.toLowerCase() !== "none");

  const prioritiesMd = `# Current Priorities

*As of ${today()}*

## Focus Areas
${focusList.map(f => `- ${f}`).join("\n") || "- [Add priorities here]"}

${deadlineList.length ? `## Deadlines\n${deadlineList.map(d => `- ${d}`).join("\n")}\n` : ""}
*Update this file whenever your focus shifts.*
`;

  // ── context/goals.md ───────────────────────────────────────────────────────
  const goalsMd = `# Goals — ${currentQuarter()}

> Update this file at the start of each quarter.

${goals === focuses
  ? focusList.map(f => `- [ ] ${f}`).join("\n")
  : goals.split("\n").map(l => l.trim()).filter(Boolean).map(l => `- [ ] ${l}`).join("\n")
}

*Last updated: ${today()}*
`;

  // ── .claude/rules/communication-style.md ──────────────────────────────────
  const commStyleMd = `# Communication Style

## Format Preferences
${format}

## Pet Peeves
${peeves}

## Internal Tone (working with me)
${internal}

## External / Public-Facing Tone
${external}
`;

  // ── templates/session-summary.md ──────────────────────────────────────────
  const sessionSummaryMd = `# Session Summary

**Date:**
**Focus:**

## What Got Done
-

## Decisions Made
-

## Open Items / Next Steps
-

## Memory Updates
- Preferences learned:
- Decisions to log:
`;

  // ── decisions/log.md ──────────────────────────────────────────────────────
  const decisionLogMd = `# Decision Log

Append-only. When a meaningful decision is made, log it here.

Format: [YYYY-MM-DD] DECISION: ... | REASONING: ... | CONTEXT: ...

---
`;

  // ── .gitignore ─────────────────────────────────────────────────────────────
  const gitignore = `.env
CLAUDE.local.md
.claude/settings.local.json
node_modules/
`;

  // ── CLAUDE.local.md ────────────────────────────────────────────────────────
  const claudeLocalMd = `# Local Overrides

Personal preferences and overrides that don't get shared via git.
Add anything here that's specific to your local setup.
`;

  // ── .claude/settings.json ─────────────────────────────────────────────────
  const settingsJson = `{}
`;

  // ── Build output map ───────────────────────────────────────────────────────
  const files = {
    "CLAUDE.md":                          claudeMd,
    "CLAUDE.local.md":                    claudeLocalMd,
    ".gitignore":                         gitignore,
    ".claude/settings.json":             settingsJson,
    ".claude/rules/communication-style.md": commStyleMd,
    ".claude/skills/.gitkeep":           "",
    "context/me.md":                      meMd,
    "context/work.md":                    workMd,
    "context/team.md":                    teamMd,
    "context/current-priorities.md":      prioritiesMd,
    "context/goals.md":                   goalsMd,
    "templates/session-summary.md":       sessionSummaryMd,
    "references/sops/.gitkeep":          "",
    "references/examples/.gitkeep":      "",
    "decisions/log.md":                   decisionLogMd,
    "archives/.gitkeep":                 "",
  };

  // Add project folders
  parsedProjects.forEach(proj => {
    const slug = slugify(proj.name);
    files[`projects/${slug}/README.md`] = `# ${proj.name}\n\n**Status:** ${proj.status}\n**Description:** [Add one-line description]\n**Key dates:** [Add deadlines or milestones]\n`;
  });

  if (parsedProjects.length === 0) {
    files["projects/.gitkeep"] = "";
  }

  return files;
}

// Returns the list of output file paths for display
export function getSecondBrainFileList(answers) {
  return Object.keys(genSecondBrainFiles(answers));
}
