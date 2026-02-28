# claude.md

> Read soul.md first. design.md before UI.

## Overview: Context Forge generates production-ready project scaffold files by asking developers 10 focused questions, auto-detecting tech stacks, and outputting soul.md, claude.md, design.md, package.json, tsconfig.json, types.ts, .env.example, README.md, TASKS.md, and .cursorrules
## User: Solo developers and small teams (ages 20-45) who use AI coding assistants like Claude, Cursor, or Copilot. They need structured context files so their AI agents understand the project from day one.
## Stack: React 19, Vite 6, TypeScript, Vitest, ESLint
Detected: vite, typescript

## Data
Question (id, label, icon, color, title, sub, ph, out, why, w, smart). StackPattern (deps, devDeps, type). IntegrationConfig (id, name, icon, color, desc, fields). ConfResult (individual, overall, issues)
- **Question**: id, label, icon, color, title, sub, ph, out, why, w, smart
- **StackPattern**: deps, devDeps, type
- **IntegrationConfig**: id, name, icon, color, desc, fields
- **ConfResult**: individual, overall, issues

## Build Order
1. Open app and see 10 questions.
2. Fill in answers and live preview updates.
3. Click Generate and scaffold files created.
4. Export via clipboard, download, Airtable, or Google Sheets

## Auth: No auth required. Fully client-side SPA with localStorage persistence.
## Integrations: Airtable API for export. Google Sheets API for export. No other external services.
## Guardrails: Client-side only. No backend. No external dependencies beyond React. All detection engines must be pure functions. Design tokens must be used instead of hardcoded values. TypeScript strict mode for data and engine layers.
## Done: All 10 scaffold files generate correctly from user input. Live preview updates in real-time. Export to clipboard, download, Airtable, and Google Sheets all work. 115 unit tests pass. Build, lint, and typecheck all clean.

## Style: TS strict. Functional. Named exports. Error boundaries.
