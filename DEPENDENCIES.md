# Context Forge — Dependency & Architecture Map

## Overview

Context Forge is a **client-side React SPA** that scaffolds project configuration files
by asking users 10 focused questions, auto-detecting tech stacks, and generating
production-ready output. The codebase follows a **modular architecture** with clear
separation between data, engines, exporters, components, and layouts.

---

## External Dependencies

| Package                  | Version   | Type | Purpose                    |
|--------------------------|-----------|------|----------------------------|
| `react`                  | ^19.0.0   | prod | UI framework               |
| `react-dom`              | ^19.0.0   | prod | DOM rendering              |
| `vite`                   | ^6.0.0    | dev  | Build tool & dev server    |
| `@vitejs/plugin-react`   | ^4.3.0    | dev  | React JSX/HMR support      |
| `typescript`             | ^5.6.0    | dev  | Type checking              |
| `typescript-eslint`      | ^8.56.0   | dev  | ESLint TypeScript parser   |
| `vitest`                 | ^3.0.0    | dev  | Unit test framework        |
| `eslint`                 | ^9.0.0    | dev  | Linting                    |
| `@eslint/js`             | ^9.0.0    | dev  | ESLint base config         |
| `eslint-plugin-react`    | ^7.37.0   | dev  | React lint rules           |
| `eslint-plugin-react-hooks` | ^5.0.0 | dev  | Hooks lint rules           |
| `globals`                | ^15.0.0   | dev  | ESLint browser globals     |
| `prettier`               | ^3.4.0    | dev  | Code formatting            |

**Total production dependencies: 2** (react + react-dom)

---

## File Structure

```
context-forge/
├── index.html                ← HTML shell, loads fonts + mounts #root
├── package.json              ← Deps & scripts (dev | build | preview | test | lint | typecheck)
├── vite.config.js            ← Vite config (react plugin, dist output)
├── vitest.config.js          ← Vitest test runner config
├── tsconfig.json             ← TypeScript strict config
├── eslint.config.js          ← ESLint 9 flat config (React + TS)
├── .prettierrc               ← Prettier formatting config
├── .github/workflows/ci.yml  ← GitHub Actions CI pipeline
├── soul.md                   ← Project north star (self-generated)
├── claude.md                 ← AI agent context (self-generated)
├── design.md                 ← Design system spec (self-generated)
├── TASKS.md                  ← Build phases (self-generated)
├── .cursorrules              ← AI guardrails (self-generated)
├── .env.example              ← Environment variable template
├── DEPENDENCIES.md           ← This file
└── src/
    ├── main.jsx              ← ReactDOM entry point
    ├── App.jsx               ← Root orchestrator (~52 lines)
    ├── tokens/
    │   └── index.js          ← Design tokens (colors, fonts, spacing, radii, animations, globalStyles)
    ├── data/                 ← (TypeScript, strict typed)
    │   ├── questions.ts      ← QS[] — 10 question definitions (Question interface)
    │   ├── stackPatterns.ts  ← STACK_PATTERNS{} — framework/tool → npm mapping (StackPattern)
    │   ├── integrations.ts   ← INTEGRATIONS[] — Airtable & Sheets config (IntegrationConfig)
    │   └── localStorage.ts   ← LS{} — prefixed localStorage wrapper (generic typed)
    ├── engines/              ← (TypeScript, strict typed, 115 unit tests)
    │   ├── index.ts          ← Barrel re-export for all engines
    │   ├── detectStack.ts    ← detectStack(text) → StackResult
    │   ├── detectAuth.ts     ← detectAuth(text) → AuthProvider[]
    │   ├── detectIntegrations.ts ← detectIntegrations(text) → Integration[]
    │   ├── parseDataModel.ts ← parseDataModel(text) → Entity[]
    │   ├── parseFlow.ts      ← parseFlow(text) → FlowStep[]
    │   ├── genFiles.ts       ← genFiles(answers) → Record<string, string>
    │   ├── calcConf.ts       ← calcConf(answers) → ConfResult
    │   └── __tests__/        ← 7 test files, 115 tests
    │       ├── detectStack.test.js
    │       ├── detectAuth.test.js
    │       ├── detectIntegrations.test.js
    │       ├── parseDataModel.test.js
    │       ├── parseFlow.test.js
    │       ├── genFiles.test.js
    │       └── calcConf.test.js
    ├── exporters/
    │   ├── index.js          ← Barrel re-export for all exporters
    │   ├── airtable.js       ← exportToAirtable(config, answers, files)
    │   ├── sheets.js         ← exportToSheets(config, answers, files)
    │   ├── download.js       ← downloadZip(files) → .txt bundle
    │   └── clipboard.js      ← copyAll(files) → clipboard
    ├── hooks/
    │   └── useIsMobile.js    ← useIsMobile(bp=768) → responsive breakpoint
    ├── components/           ← (uses design tokens from tokens/index.js)
    │   ├── index.js          ← Barrel re-export for all components
    │   ├── Ring.jsx          ← SVG confidence circle
    │   ├── Badges.jsx        ← Detected stack/auth/integration badges
    │   ├── CodeView.jsx      ← Syntax-highlighted file viewer
    │   ├── Particles.jsx     ← Celebration particle animation
    │   ├── SettingsPanel.jsx ← Integration config modal (Airtable + Sheets)
    │   └── ExportMenu.jsx    ← Export target picker modal
    └── layouts/              ← (uses design tokens from tokens/index.js)
        ├── Mobile.jsx        ← 3-tab mobile layout (edit/files/graph)
        └── Desktop.jsx       ← 3-panel desktop layout (sidebar/center/preview)
```

---

## ASCII Dependency Diagram

```
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │                        CONTEXT FORGE — DEPENDENCY MAP                       │
 └──────────────────────────────────────────────────────────────────────────────┘

 ENTRY
 ═════
   index.html
       │
       ▼
 ┌───────────┐       ┌────────────┐       ┌─────────────────────┐
 │  main.jsx  │──────▶│  react     │       │  react-dom/client   │
 │  (entry)   │──────▶│            │       │  (createRoot)       │
 └─────┬──────┘       └────────────┘       └─────────────────────┘
       │
       │ import App from './App'
       ▼
 ┌───────────────────────────────────────────────────────────────────────┐
 │                          App.jsx (orchestrator)                      │
 │                                                                      │
 │  IMPORTS:                                                            │
 │    react ─── useState, useEffect, useMemo, useCallback              │
 │    tokens ── globalStyles                                            │
 │    data ──── LS (localStorage)                                       │
 │    engines ─ genFiles, calcConf                                      │
 │    hooks ─── useIsMobile                                             │
 │    components ── Particles, SettingsPanel, ExportMenu                │
 │    layouts ───── Mobile, Desktop                                     │
 └───────────────────────────────────────────────────────────────────────┘
       │
       │ delegates to
       ▼
 ┌──────────┐           ┌──────────┐
 │  Mobile  │           │ Desktop  │
 │ (< 768)  │           │ (≥ 768)  │
 └────┬─────┘           └────┬─────┘
      │                      │
      │   both import:       │
      ├──────────────────────┤
      │                      │
      ▼                      ▼
 ┌─────────────────────────────────────────────────────────┐
 │  QS (data/questions)  Ring  Badges  CodeView  copyAll   │
 └─────────────────────────────────────────────────────────┘


 DATA LAYER (no imports from other src/ modules)
 ════════════════════════════════════════════════
 ┌──────────────────┐  ┌──────────────────────┐
 │  data/questions   │  │  data/stackPatterns  │
 │  QS[]             │  │  STACK_PATTERNS{}    │
 └──────────────────┘  └──────────────────────┘
 ┌──────────────────┐  ┌──────────────────────┐
 │  data/integrations│  │  data/localStorage   │
 │  INTEGRATIONS[]   │  │  LS{}                │
 └──────────────────┘  └──────────────────────┘
 ┌──────────────────┐
 │  tokens/index     │
 │  colors, fonts,   │
 │  spacing, radii,  │
 │  globalStyles     │
 └──────────────────┘


 DETECTION ENGINES (pure functions)
 ═══════════════════════════════════
 ┌───────────────────┐     imports     ┌───────────────────┐
 │  detectStack      │◀──────────────── │  data/stackPatterns│
 │  (text) → deps    │                 └───────────────────┘
 └───────────────────┘
 ┌───────────────────┐
 │  detectAuth       │  (no imports from src/)
 │  (text) → auth[]  │
 └───────────────────┘
 ┌───────────────────┐
 │  detectIntegrations│  (no imports from src/)
 │  (text) → svcs[]   │
 └───────────────────┘
 ┌───────────────────┐
 │  parseDataModel    │  (no imports from src/)
 │  (text) → entities│
 └───────────────────┘
 ┌───────────────────┐
 │  parseFlow         │  (no imports from src/)
 │  (text) → steps[] │
 └───────────────────┘

          ┌────────────────────────────────────┐
          │                                    │
          ▼                                    ▼
 ┌──────────────────┐              ┌──────────────────────┐
 │   genFiles()     │              │   calcConf()         │
 │                  │              │                      │
 │ Imports:         │              │ Imports:             │
 │  data/questions  │              │  data/questions      │
 │  detectStack     │              │  detectStack         │
 │  detectAuth      │              │  detectAuth          │
 │  detectInteg.    │              │  detectInteg.        │
 │  parseDataModel  │              │  parseDataModel      │
 │  parseFlow       │              │                      │
 │                  │              │ Returns: { overall,  │
 │ Returns: 10 files│              │   individual, issues}│
 └──────────────────┘              └──────────────────────┘


 EXPORT HANDLERS
 ═══════════════
 ┌──────────────────┐                    (no src/ imports)
 │  clipboard.js    │ copyAll(files) ───▶ Clipboard API
 └──────────────────┘
 ┌──────────────────┐                    (no src/ imports)
 │  download.js     │ downloadZip(files) ▶ Blob/URL download
 └──────────────────┘
 ┌──────────────────┐
 │  airtable.js     │ exportToAirtable() ▶ api.airtable.com
 │  imports: calcConf│
 └──────────────────┘
 ┌──────────────────┐
 │  sheets.js       │ exportToSheets() ──▶ sheets.googleapis.com
 │  imports: calcConf│
 └──────────────────┘


 UI COMPONENTS
 ═════════════
 ┌──────────────────────────────────────────────────────────┐
 │  Ring        ← (no src/ imports, pure SVG)               │
 │  Particles   ← (no src/ imports, pure CSS animation)     │
 │  CodeView    ← (no src/ imports, react only)             │
 │  Badges      ← data/questions + all 5 detection engines  │
 │  SettingsPanel ← data/integrations + data/localStorage   │
 │  ExportMenu  ← all 4 exporters                          │
 └──────────────────────────────────────────────────────────┘
```

---

## Per-File Import Map

| File | Imports from `src/` |
|------|-------------------|
| `main.jsx` | `App` |
| `App.jsx` | `tokens/index` `data/localStorage` `engines/{genFiles,calcConf}` `hooks/useIsMobile` `components/{Particles,SettingsPanel,ExportMenu}` `layouts/{Mobile,Desktop}` |
| `tokens/index.js` | *(none)* |
| `data/questions.ts` | *(none)* |
| `data/stackPatterns.ts` | *(none)* |
| `data/integrations.ts` | *(none)* |
| `data/localStorage.ts` | *(none)* |
| `engines/detectStack.ts` | `data/stackPatterns` |
| `engines/detectAuth.ts` | *(none)* |
| `engines/detectIntegrations.ts` | *(none)* |
| `engines/parseDataModel.ts` | *(none)* |
| `engines/parseFlow.ts` | *(none)* |
| `engines/genFiles.ts` | `data/questions` `engines/{detectStack,detectAuth,detectIntegrations,parseDataModel,parseFlow}` |
| `engines/calcConf.ts` | `data/questions` `engines/{detectStack,detectAuth,detectIntegrations,parseDataModel}` |
| `exporters/clipboard.js` | *(none)* |
| `exporters/download.js` | *(none)* |
| `exporters/airtable.js` | `engines/calcConf` |
| `exporters/sheets.js` | `engines/calcConf` |
| `hooks/useIsMobile.js` | *(none — react only)* |
| `components/Ring.jsx` | `tokens` |
| `components/Badges.jsx` | `tokens` `data/questions` `engines/{detectStack,detectAuth,detectIntegrations,parseDataModel,parseFlow}` |
| `components/CodeView.jsx` | `tokens` |
| `components/Particles.jsx` | `tokens` |
| `components/SettingsPanel.jsx` | `tokens` `data/integrations` `data/localStorage` |
| `components/ExportMenu.jsx` | `tokens` `exporters/{airtable,sheets,download,clipboard}` |
| `layouts/Mobile.jsx` | `tokens` `data/questions` `exporters/clipboard` `components/{Ring,Badges,CodeView}` |
| `layouts/Desktop.jsx` | `tokens` `data/questions` `components/{Ring,Badges,CodeView}` |

---

## Internal Function Dependency Matrix

| Caller ↓ / Callee →    | detectStack | detectAuth | detectInteg. | parseDataModel | parseFlow | calcConf |
|-------------------------|:-----------:|:----------:|:------------:|:--------------:|:---------:|:--------:|
| **genFiles()**          |      ✓      |     ✓      |      ✓       |       ✓        |     ✓     |          |
| **calcConf()**          |      ✓      |     ✓      |      ✓       |       ✓        |           |          |
| **Badges()**            |      ✓      |     ✓      |      ✓       |       ✓        |     ✓     |          |
| **exportToAirtable()**  |             |            |              |                |           |    ✓     |
| **exportToSheets()**    |             |            |              |                |           |    ✓     |

- No circular dependencies detected
- All detection/parsing functions are **pure** (no side effects)
- `calcConf` is used by both `App.jsx` (via import) and exporters (for confidence score)

---

## Data Flow

```
 ┌─────────┐    ┌──────────┐    ┌───────────────┐    ┌──────────┐
 │  User   │───▶│ answers  │───▶│  genFiles()   │───▶│ CodeView │
 │  Input  │    │ state[10]│    │  calcConf()   │    │ + Export │
 │(10 Q's) │    │          │    │               │    │          │
 └─────────┘    └──────────┘    └───────────────┘    └──────────┘
                     │                                      │
                     ▼                                      ▼
                ┌──────────┐                         ┌──────────────┐
                │  LS.*    │                         │  Airtable /  │
                │  (save)  │                         │  Sheets /    │
                └──────────┘                         │  Clipboard / │
                                                     │  Download    │
                                                     └──────────────┘
```

---

## Build & Quality Toolchain

```
 ┌────────────────┐       ┌──────────────────────┐
 │  vite.config.js│──────▶│  vite ^6.0.0         │
 │                │──────▶│  @vitejs/plugin-react │
 └────────────────┘       └──────────────────────┘
 ┌────────────────┐       ┌──────────────────────┐
 │  tsconfig.json │──────▶│  typescript ^5.6.0   │
 └────────────────┘       └──────────────────────┘
 ┌────────────────┐       ┌──────────────────────┐
 │ vitest.config.js──────▶│  vitest ^3.0.0       │
 └────────────────┘       └──────────────────────┘
 ┌────────────────┐       ┌──────────────────────┐
 │eslint.config.js│──────▶│  eslint ^9.0.0       │
 │                │──────▶│  typescript-eslint    │
 └────────────────┘       └──────────────────────┘
 ┌────────────────┐       ┌──────────────────────┐
 │  .prettierrc   │──────▶│  prettier ^3.4.0     │
 └────────────────┘       └──────────────────────┘

 npm scripts:
   dev        → vite
   build      → vite build
   test       → vitest run         (115 tests)
   typecheck  → tsc --noEmit       (strict mode)
   lint       → eslint src/        (0 errors, 0 warnings)
   format     → prettier --write
```

---

## External API Calls (runtime)

```
 ┌──────────────────┐     ┌─────────────────────────────────────┐
 │ exportToAirtable │────▶│ POST api.airtable.com/v0/{base}/{t} │
 └──────────────────┘     └─────────────────────────────────────┘
 ┌──────────────────┐     ┌─────────────────────────────────────┐
 │ exportToSheets   │────▶│ POST sheets.googleapis.com/v4/...   │
 └──────────────────┘     └─────────────────────────────────────┘
 ┌──────────────────┐     ┌────────────────────────────────────────────────┐
 │ SettingsPanel    │────▶│ GET api.airtable.com (test connection)         │
 │ (testConnection) │────▶│ GET sheets.googleapis.com (test connection)    │
 └──────────────────┘     └────────────────────────────────────────────────┘
```

---

## Browser APIs Used

```
 ┌──────────────────────────────────────────────────────────────┐
 │  localStorage   → persist answers & integration configs      │
 │  Clipboard API  → copy generated files                       │
 │  Blob / URL     → download as .txt bundle                    │
 │  fetch()        → Airtable & Google Sheets exports + tests   │
 │  addEventListener("resize") → responsive breakpoint          │
 └──────────────────────────────────────────────────────────────┘
```

---

## Key Architectural Observations

1. **Modular design**: 27+ source files across 7 directories with clear separation of concerns
2. **Zero runtime deps beyond React**: No routing, state management, or utility libraries
3. **Pure engine layer**: All detection/parsing functions are stateless, side-effect-free, and strictly typed
4. **Barrel exports**: `engines/index.ts`, `exporters/index.js`, and `components/index.js` provide clean public APIs
5. **No circular dependencies**: Dependency graph is a clean DAG
6. **115 unit tests**: Full coverage of all 7 engine functions via Vitest
7. **TypeScript strict mode**: Data and engine layers fully typed with exported interfaces
8. **CI/CD pipeline**: GitHub Actions runs lint, format check, and build on every PR
9. **Design token system**: All components use centralized tokens from `tokens/index.js`
10. **Client-side only**: No backend, no SSR, no database
11. **Self-documenting**: Scaffold context files (soul.md, claude.md, etc.) generated by its own engine
