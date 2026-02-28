# Context Forge — Dependency & Architecture Map

## Overview

Context Forge is a **client-side React SPA** that scaffolds project configuration files
by asking users 10 focused questions, auto-detecting tech stacks, and generating
production-ready output. It has a remarkably minimal external dependency footprint.

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
├── index.html              ← HTML shell, loads fonts + mounts #root
├── package.json            ← Deps & scripts (dev | build | preview)
├── vite.config.js          ← Vite config (react plugin, dist output)
└── src/
    ├── main.jsx            ← ReactDOM entry point
    └── App.jsx             ← Entire application (873 lines, ~66 KB)
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
 │  main.jsx │──────▶│  react     │       │  react-dom/client   │
 │  (entry)  │──────▶│  (hooks)   │       │  (createRoot)       │
 └─────┬─────┘       └────────────┘       └─────────────────────┘
       │
       │ import App from './App'
       ▼
 ┌───────────────────────────────────────────────────────────────────┐
 │                         App.jsx (873 lines)                      │
 │                                                                   │
 │  IMPORTS: { useState, useRef, useEffect, useCallback, useMemo }  │
 │           from "react"                                            │
 │                                                                   │
 │  ┌─────────────────────────────────────────────────────────────┐  │
 │  │                    STATIC DATA LAYER                        │  │
 │  │                                                             │  │
 │  │  QS[]              10 question definitions                  │  │
 │  │  STACK_PATTERNS{}   Framework/tool detection patterns       │  │
 │  │  INTEGRATIONS[]    Integration config definitions           │  │
 │  │  LS{}              localStorage get/set/del wrapper         │  │
 │  └─────────────────────────────────────────────────────────────┘  │
 │                          │                                        │
 │                          ▼                                        │
 │  ┌─────────────────────────────────────────────────────────────┐  │
 │  │                  DETECTION ENGINES (pure)                   │  │
 │  │                                                             │  │
 │  │  detectStack(text)         → npm packages + types           │  │
 │  │  detectAuth(text)          → auth methods                   │  │
 │  │  detectIntegrations(text)  → 3rd-party services             │  │
 │  │  parseDataModel(text)      → TypeScript interfaces          │  │
 │  │  parseFlow(text)           → user flow steps                │  │
 │  └─────────────────────────────────────────────────────────────┘  │
 │                     │                  │                           │
 │            ┌────────┘                  └────────┐                 │
 │            ▼                                    ▼                 │
 │  ┌──────────────────┐              ┌──────────────────────┐      │
 │  │   genFiles()     │              │   calcConf()         │      │
 │  │                  │              │                      │      │
 │  │ Calls:           │              │ Calls:               │      │
 │  │  detectStack     │              │  detectStack         │      │
 │  │  detectAuth      │              │  parseDataModel      │      │
 │  │  detectInteg.    │              │  detectAuth          │      │
 │  │  parseDataModel  │              │  detectInteg.        │      │
 │  │  parseFlow       │              │                      │      │
 │  │                  │              │ Returns: 0.0 → 1.0   │      │
 │  │ Returns: 10 files│              └──────────────────────┘      │
 │  └──────────────────┘                                            │
 │            │                                                      │
 │            ▼                                                      │
 │  ┌─────────────────────────────────────────────────────────────┐  │
 │  │                    EXPORT HANDLERS                          │  │
 │  │                                                             │  │
 │  │  copyAll(files)          → Clipboard API                    │  │
 │  │  downloadZip(files)      → Blob/File download               │  │
 │  │  exportToAirtable()  ──────▶ api.airtable.com               │  │
 │  │  exportToSheets()    ──────▶ sheets.googleapis.com          │  │
 │  └─────────────────────────────────────────────────────────────┘  │
 │                                                                   │
 │  ┌─────────────────────────────────────────────────────────────┐  │
 │  │                    UI COMPONENTS                            │  │
 │  │                                                             │  │
 │  │  useIsMobile(bp=768)   Hook: responsive breakpoint          │  │
 │  │  Ring()                SVG confidence circle                │  │
 │  │  Badges()              Detected stack/auth/integrations     │  │
 │  │  CodeView()            Syntax-highlighted file viewer       │  │
 │  │  Particles()           Celebration animation                │  │
 │  │  SettingsPanel()       Airtable + Google Sheets config      │  │
 │  │  ExportMenu()          4 export targets                     │  │
 │  │                                                             │  │
 │  │         ┌──────────────┬──────────────┐                     │  │
 │  │         ▼              ▼              ▼                     │  │
 │  │    ┌─────────┐   ┌──────────┐   ┌─────────┐               │  │
 │  │    │ Mobile  │   │ Desktop  │   │  App()  │               │  │
 │  │    │ (tabs)  │   │ (3-panel)│   │ (root)  │               │  │
 │  │    └─────────┘   └──────────┘   └─────────┘               │  │
 │  └─────────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────────────────────┘

 BUILD TOOLCHAIN
 ═══════════════
 ┌────────────────┐       ┌──────────────────────┐
 │  vite.config.js│──────▶│  vite ^6.0.0         │
 │                │──────▶│  @vitejs/plugin-react │
 └────────────────┘       └──────────────────────┘

 EXTERNAL API CALLS (runtime)
 ════════════════════════════
 ┌──────────────────┐     ┌─────────────────────────────────────┐
 │ exportToAirtable │────▶│ POST api.airtable.com/v0/{base}/{t} │
 └──────────────────┘     └─────────────────────────────────────┘
 ┌──────────────────┐     ┌─────────────────────────────────────┐
 │ exportToSheets   │────▶│ POST sheets.googleapis.com/v4/...   │
 └──────────────────┘     └─────────────────────────────────────┘

 BROWSER APIs USED
 ═════════════════
 ┌──────────────────────────────────────────────────────────────┐
 │  localStorage   → persist answers & integration configs      │
 │  Clipboard API  → copy generated files                       │
 │  Blob / URL     → download as .txt bundle                    │
 │  fetch()        → Airtable & Google Sheets exports           │
 │  matchMedia()   → responsive breakpoint detection            │
 └──────────────────────────────────────────────────────────────┘

 DATA FLOW
 ═════════
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

## Internal Function Dependency Matrix

| Caller ↓ / Callee →    | detectStack | detectAuth | detectInteg. | parseDataModel | parseFlow |
|-------------------------|:-----------:|:----------:|:------------:|:--------------:|:---------:|
| **genFiles()**          |      ✓      |     ✓      |      ✓       |       ✓        |     ✓     |
| **calcConf()**          |      ✓      |     ✓      |      ✓       |       ✓        |           |
| **Badges()**            |      ✓      |     ✓      |      ✓       |       ✓        |     ✓     |
| **exportToAirtable()**  |             |            |              |                |           |
| **exportToSheets()**    |             |            |              |                |           |

- No circular dependencies detected
- All detection/parsing functions are **pure** (no side effects)

---

## Key Architectural Observations

1. **Monolith**: The entire app lives in a single 873-line `App.jsx` file
2. **Zero runtime deps**: Only React — no routing, state management, or utility libraries
3. **No tests**: No test framework, no test files
4. **No TypeScript**: Plain JSX despite generating TypeScript for users
5. **No CI/CD**: No GitHub Actions, no linting, no formatting config
6. **No code splitting**: Everything bundled together
7. **Client-side only**: No backend, no SSR, no database

---

## Proposed Next Steps

### High Priority — Code Quality & Maintainability

1. **Decompose App.jsx into modules**
   Split the monolithic 873-line file into logical modules:
   ```
   src/
   ├── main.jsx
   ├── App.jsx                  (slim orchestrator)
   ├── hooks/
   │   └── useIsMobile.js
   ├── engines/
   │   ├── detectStack.js
   │   ├── detectAuth.js
   │   ├── detectIntegrations.js
   │   ├── parseDataModel.js
   │   ├── parseFlow.js
   │   ├── genFiles.js
   │   └── calcConf.js
   ├── exporters/
   │   ├── airtable.js
   │   ├── sheets.js
   │   ├── download.js
   │   └── clipboard.js
   ├── components/
   │   ├── Ring.jsx
   │   ├── Badges.jsx
   │   ├── CodeView.jsx
   │   ├── Particles.jsx
   │   ├── SettingsPanel.jsx
   │   ├── ExportMenu.jsx
   │   ├── Mobile.jsx
   │   └── Desktop.jsx
   └── data/
       ├── questions.js
       └── stackPatterns.js
   ```

2. **Add TypeScript**
   The app generates TypeScript config and types for users — it should use TypeScript itself.
   Rename `.jsx` → `.tsx`, add `tsconfig.json`, type all functions.

3. **Add a test framework**
   The pure detection/parsing engines are ideal candidates for unit testing.
   Add Vitest (pairs naturally with Vite) and write tests for `detectStack`,
   `parseDataModel`, `calcConf`, etc.

### Medium Priority — Developer Experience

4. **Add ESLint + Prettier**
   No linting or formatting is configured. Add `eslint` with
   `eslint-plugin-react` and `prettier` for consistent code style.

5. **Add CI/CD pipeline**
   Create a GitHub Actions workflow for lint → type-check → test → build
   on every PR.

6. **Add error boundaries**
   The app has no React error boundaries. A single runtime error crashes
   the entire UI with no recovery path.

### Lower Priority — Features & Performance

7. **Code splitting / lazy loading**
   Lazy-load `SettingsPanel`, `ExportMenu`, and `Particles` since they're
   modal/conditional. This reduces initial bundle size.

8. **Accessibility audit**
   Add ARIA labels, keyboard navigation, focus management, and screen
   reader support — especially for the tabbed mobile interface.

9. **Offline support / PWA**
   Since the app is fully client-side, adding a service worker and manifest
   would let it work offline and be installable.

10. **State management upgrade**
    If complexity grows, consider `useReducer` or Zustand to replace the
    current 10+ `useState` calls with a single store.
