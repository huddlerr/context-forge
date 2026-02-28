# Context Forge — Dependency & Architecture Map

## Overview

Context Forge is a **client-side React SPA** that scaffolds project configuration files
by asking users 10 focused questions, auto-detecting tech stacks, and generating
production-ready output. The codebase follows a **modular architecture** with clear
separation between data, engines, exporters, components, and layouts.

---

## External Dependencies

| Package                | Version  | Type | Purpose                    |
|------------------------|----------|------|----------------------------|
| `react`                | ^19.0.0  | prod | UI framework               |
| `react-dom`            | ^19.0.0  | prod | DOM rendering              |
| `vite`                 | ^6.0.0   | dev  | Build tool & dev server    |
| `@vitejs/plugin-react` | ^4.3.0  | dev  | React JSX/HMR support      |

**Total production dependencies: 2** (react + react-dom)

---

## File Structure

```
context-forge/
├── index.html                ← HTML shell, loads fonts + mounts #root
├── package.json              ← Deps & scripts (dev | build | preview)
├── vite.config.js            ← Vite config (react plugin, dist output)
└── src/
    ├── main.jsx              ← ReactDOM entry point
    ├── App.jsx               ← Root orchestrator (~52 lines)
    ├── tokens/
    │   └── index.js          ← Design tokens (colors, fonts, spacing, radii, animations, globalStyles)
    ├── data/
    │   ├── questions.js      ← QS[] — 10 question definitions
    │   ├── stackPatterns.js  ← STACK_PATTERNS{} — framework/tool → npm package mapping
    │   ├── integrations.js   ← INTEGRATIONS[] — Airtable & Google Sheets config
    │   └── localStorage.js   ← LS{} — prefixed localStorage get/set/del wrapper
    ├── engines/
    │   ├── index.js          ← Barrel re-export for all engines
    │   ├── detectStack.js    ← detectStack(text) → detected packages + types
    │   ├── detectAuth.js     ← detectAuth(text) → auth providers + env keys
    │   ├── detectIntegrations.js ← detectIntegrations(text) → 3rd-party services
    │   ├── parseDataModel.js ← parseDataModel(text) → entity/field definitions
    │   ├── parseFlow.js      ← parseFlow(text) → numbered user flow steps
    │   ├── genFiles.js       ← genFiles(answers) → 10 scaffold files
    │   └── calcConf.js       ← calcConf(answers) → confidence score 0.0–1.0
    ├── exporters/
    │   ├── index.js          ← Barrel re-export for all exporters
    │   ├── airtable.js       ← exportToAirtable(config, answers, files)
    │   ├── sheets.js         ← exportToSheets(config, answers, files)
    │   ├── download.js       ← downloadZip(files) → .txt bundle
    │   └── clipboard.js      ← copyAll(files) → clipboard
    ├── hooks/
    │   └── useIsMobile.js    ← useIsMobile(bp=768) → responsive breakpoint
    ├── components/
    │   ├── index.js          ← Barrel re-export for all components
    │   ├── Ring.jsx          ← SVG confidence circle
    │   ├── Badges.jsx        ← Detected stack/auth/integration badges
    │   ├── CodeView.jsx      ← Syntax-highlighted file viewer
    │   ├── Particles.jsx     ← Celebration particle animation
    │   ├── SettingsPanel.jsx ← Integration config modal (Airtable + Sheets)
    │   └── ExportMenu.jsx    ← Export target picker modal
    └── layouts/
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
| `data/questions.js` | *(none)* |
| `data/stackPatterns.js` | *(none)* |
| `data/integrations.js` | *(none)* |
| `data/localStorage.js` | *(none)* |
| `engines/detectStack.js` | `data/stackPatterns` |
| `engines/detectAuth.js` | *(none)* |
| `engines/detectIntegrations.js` | *(none)* |
| `engines/parseDataModel.js` | *(none)* |
| `engines/parseFlow.js` | *(none)* |
| `engines/genFiles.js` | `data/questions` `engines/{detectStack,detectAuth,detectIntegrations,parseDataModel,parseFlow}` |
| `engines/calcConf.js` | `data/questions` `engines/{detectStack,detectAuth,detectIntegrations,parseDataModel}` |
| `exporters/clipboard.js` | *(none)* |
| `exporters/download.js` | *(none)* |
| `exporters/airtable.js` | `engines/calcConf` |
| `exporters/sheets.js` | `engines/calcConf` |
| `hooks/useIsMobile.js` | *(none — react only)* |
| `components/Ring.jsx` | *(none — pure SVG)* |
| `components/Badges.jsx` | `data/questions` `engines/{detectStack,detectAuth,detectIntegrations,parseDataModel,parseFlow}` |
| `components/CodeView.jsx` | *(none — react only)* |
| `components/Particles.jsx` | *(none — pure JSX)* |
| `components/SettingsPanel.jsx` | `data/integrations` `data/localStorage` |
| `components/ExportMenu.jsx` | `exporters/{airtable,sheets,download,clipboard}` |
| `layouts/Mobile.jsx` | `data/questions` `exporters/clipboard` `components/{Ring,Badges,CodeView}` |
| `layouts/Desktop.jsx` | `data/questions` `components/{Ring,Badges,CodeView}` |

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

## Build Toolchain

```
 ┌────────────────┐       ┌──────────────────────┐
 │  vite.config.js│──────▶│  vite ^6.0.0         │
 │                │──────▶│  @vitejs/plugin-react │
 └────────────────┘       └──────────────────────┘
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

1. **Modular design**: 27 source files across 7 directories with clear separation of concerns
2. **Zero runtime deps beyond React**: No routing, state management, or utility libraries
3. **Pure engine layer**: All detection/parsing functions are stateless and side-effect-free
4. **Barrel exports**: `engines/index.js`, `exporters/index.js`, and `components/index.js` provide clean public APIs
5. **No circular dependencies**: Dependency graph is a clean DAG
6. **No tests**: No test framework, no test files
7. **No TypeScript**: Plain JSX despite generating TypeScript for users
8. **No CI/CD**: No GitHub Actions, no linting, no formatting config
9. **No code splitting**: Everything bundled together (but modular structure makes it easy to add)
10. **Client-side only**: No backend, no SSR, no database
