# claude.md

> Read soul.md first. design.md before UI.

## Overview: Context Forge is a dual-mode tool. **Mode 1 — Project Scaffold**: generates production-ready project scaffold files by asking developers 10 focused questions, auto-detecting tech stacks, and outputting soul.md, claude.md, design.md, package.json, tsconfig.json, types.ts, .env.example, README.md, TASKS.md, and .cursorrules. **Mode 2 — Second Brain**: generates a personal executive assistant setup for Claude Code by asking 6 onboarding sections (24 questions), outputting CLAUDE.md, context files, .claude/rules/, templates/, decisions/log.md, and project folders.
## User: Solo developers and small teams (ages 20-45) who use AI coding assistants like Claude, Cursor, or Copilot. They need structured context files so their AI agents understand the project from day one.
## Stack: React 19, Vite 6, TypeScript, Vitest, ESLint
Detected: vite, typescript

## Data
### Project Scaffold
- **Question**: id, label, icon, color, title, sub, ph, out, why, w, smart
- **StackPattern**: deps, devDeps, type
- **IntegrationConfig**: id, name, icon, color, desc, fields
- **ConfResult**: individual, overall, issues
### Second Brain (src/second-brain/)
- **SBSection**: id, label, icon, color, title, sub, questions[]
- **SBQuestion**: id, label, ph, out[]
- Answers stored as flat key-value map in localStorage under "sb_answers"

## Build Order
1. Open app → Mode Selector (Project Scaffold or Second Brain).
2. **Project Scaffold**: Fill in 10 questions → live preview → Generate → export.
3. **Second Brain**: Fill in 6 sections (24 questions) → live preview → Generate Files → download folder structure.

## Auth: No auth required. Fully client-side SPA with localStorage persistence.
## Integrations: Airtable API for export. Google Sheets API for export. No other external services.
## Guardrails: Client-side only. No backend. No external dependencies beyond React. All detection engines must be pure functions. Design tokens must be used instead of hardcoded values. TypeScript strict mode for data and engine layers. Second Brain files live in src/second-brain/ — keep them isolated from core forge engines.
## Done: All 10 scaffold files generate correctly from user input. Second Brain generates 17+ files across full folder structure. Live preview updates in real-time for both modes. Mode selector on app load. Export to clipboard, download, Airtable, and Google Sheets all work. 115 unit tests pass. Build, lint, and typecheck all clean.

## Style: TS strict. Functional. Named exports. Error boundaries.
